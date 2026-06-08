(function () {
    var gallery = document.querySelector('.scroll-gallery');
    var track = document.querySelector('.scroll-gallery__track');
    if (!gallery || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var offset = 0;
    var loopWidth = 0;
        var durationMs = 120000;
    var resumeDelayMs = 1000;

    var dragging = false;
    var activePointer = null;
    var startX = 0;
    var startOffset = 0;
    var lastPointerX = 0;
    var lastPointerTime = 0;
    var flickVelocity = 0;
    var pointerMoved = false;
    var suppressClick = false;

    var paused = true;
    var inertiaActive = false;
    var velocity = 0;
    var resumeTimer = null;
    var wheelEndTimer = null;
    var lastWheelTime = 0;
    var lastFrameTime = performance.now();

    var MIN_VELOCITY = 0.015;
    var FRICTION = 0.94;
    var FLING_GAIN = 1.15;
    var DRAG_THRESHOLD = 6;

    function measure() {
        loopWidth = track.scrollWidth / 2;
    }

    function wrapOffset() {
        if (loopWidth <= 0) return;
        while (offset > 0) offset -= loopWidth;
        while (offset <= -loopWidth) offset += loopWidth;
    }

    function applyTransform() {
        track.style.transform = 'translate3d(' + offset + 'px, 0, 0)';
    }

    function clearResumeTimer() {
        if (resumeTimer) {
            clearTimeout(resumeTimer);
            resumeTimer = null;
        }
    }

    function scheduleResume() {
        clearResumeTimer();
        paused = true;
        resumeTimer = setTimeout(function () {
            paused = false;
            resumeTimer = null;
        }, resumeDelayMs);
    }

    function stopInertia() {
        inertiaActive = false;
        velocity = 0;
    }

    function beginInteraction() {
        paused = true;
        clearResumeTimer();
        stopInertia();
    }

    function startInertia(initialVelocity) {
        if (Math.abs(initialVelocity) < MIN_VELOCITY) {
            scheduleResume();
            return;
        }
        velocity = initialVelocity * FLING_GAIN;
        inertiaActive = true;
        paused = true;
    }

    function normalizeWheelDelta(e, delta) {
        if (e.deltaMode === 1) return delta * 16;
        if (e.deltaMode === 2) return delta * gallery.clientWidth;
        return delta;
    }

    function wheelDelta(e) {
        var ax = Math.abs(e.deltaX);
        var ay = Math.abs(e.deltaY);
        if (ax < 0.5 && ay < 0.5) return 0;
        if (ax >= ay) return normalizeWheelDelta(e, e.deltaX);
        return normalizeWheelDelta(e, e.deltaY);
    }

    function linkFromEvent(e) {
        return e.target.closest('a.scroll-gallery__link');
    }

    function onPointerDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        beginInteraction();
        dragging = true;
        pointerMoved = false;
        suppressClick = false;
        activePointer = e.pointerId;
        startX = e.clientX;
        startOffset = offset;
        lastPointerX = e.clientX;
        lastPointerTime = performance.now();
        flickVelocity = 0;
    }

    function onPointerMove(e) {
        if (!dragging || e.pointerId !== activePointer) return;
        var dx = e.clientX - startX;
        if (!pointerMoved && Math.abs(dx) > DRAG_THRESHOLD) {
            pointerMoved = true;
            suppressClick = true;
            gallery.classList.add('is-dragging');
            gallery.setPointerCapture(e.pointerId);
        }
        if (!pointerMoved) return;

        var now = performance.now();
        var step = e.clientX - lastPointerX;
        var dt = now - lastPointerTime;
        if (dt > 0 && dt < 120) {
            var instant = step / dt;
            flickVelocity = flickVelocity * 0.35 + instant * 0.65;
        }
        lastPointerX = e.clientX;
        lastPointerTime = now;
        offset = startOffset + dx;
        wrapOffset();
        applyTransform();
    }

    function endDrag(e) {
        if (!dragging || e.pointerId !== activePointer) return;
        dragging = false;
        activePointer = null;
        gallery.classList.remove('is-dragging');

        if (gallery.hasPointerCapture(e.pointerId)) {
            try { gallery.releasePointerCapture(e.pointerId); } catch (err) {}
        }

        if (!pointerMoved) {
            var link = linkFromEvent(e);
            if (link && link.href) {
                window.location.assign(link.href);
            }
            scheduleResume();
            return;
        }

        startInertia(flickVelocity);
    }

    function onGalleryClick(e) {
        if (suppressClick) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick = false;
        }
    }

    function onWheel(e) {
        var delta = wheelDelta(e);
        if (!delta) return;
        e.preventDefault();
        beginInteraction();

        var now = performance.now();
        var dt = Math.max(now - lastWheelTime, 1);
        lastWheelTime = now;

        offset -= delta;
        var wheelVelocity = -delta / dt;
        velocity = velocity * 0.45 + wheelVelocity * 0.55;
        wrapOffset();
        applyTransform();

        if (wheelEndTimer) clearTimeout(wheelEndTimer);
        wheelEndTimer = setTimeout(function () {
            wheelEndTimer = null;
            startInertia(velocity);
        }, 100);
    }

    function tick(now) {
        var dt = Math.min(now - lastFrameTime, 40);
        lastFrameTime = now;

        if (inertiaActive && !dragging) {
            offset += velocity * dt;
            velocity *= Math.pow(FRICTION, dt / 16.67);
            wrapOffset();
            applyTransform();
            if (Math.abs(velocity) < MIN_VELOCITY) {
                stopInertia();
                scheduleResume();
            }
        } else if (!paused && !dragging && loopWidth > 0) {
            offset -= (loopWidth / durationMs) * dt;
            wrapOffset();
            applyTransform();
        }

        requestAnimationFrame(tick);
    }

    gallery.addEventListener('pointerdown', onPointerDown);
    gallery.addEventListener('pointermove', onPointerMove);
    gallery.addEventListener('pointerup', endDrag);
    gallery.addEventListener('pointercancel', endDrag);
    gallery.addEventListener('click', onGalleryClick, true);
    gallery.addEventListener('wheel', onWheel, { passive: false });

    measure();
    paused = false;
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    track.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('load', measure);
    });
    requestAnimationFrame(tick);
})();
