(function() {
    function r(e, n, t) {
        function o(i, f) {
            if (!n[i]) {
                if (!e[i]) {
                    var c = "function" == typeof require && require;
                    if (!f && c) return c(i, !0);
                    if (u) return u(i, !0);
                    var a = new Error("Cannot find module '" + i + "'");
                    throw a.code = "MODULE_NOT_FOUND", a
                }
                var p = n[i] = {
                    exports: {}
                };
                e[i][0].call(p.exports, function(r) {
                    var n = e[i][1][r];
                    return o(n || r)
                }, p, p.exports, r, e, n, t)
            }
            return n[i].exports
        }
        for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
        return o
    }
    return r
})()({
    1: [function(require, module, exports) {
        /**
         * EvEmitter v2.1.1
         * Lil' event emitter
         * MIT License
         */

        (function(global, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS - Browserify, Webpack
                module.exports = factory();
            } else {
                // Browser globals
                global.EvEmitter = factory();
            }

        }(typeof window != 'undefined' ? window : this, function() {

            function EvEmitter() {}

            let proto = EvEmitter.prototype;

            proto.on = function(eventName, listener) {
                if (!eventName || !listener) return this;

                // set events hash
                let events = this._events = this._events || {};
                // set listeners array
                let listeners = events[eventName] = events[eventName] || [];
                // only add once
                if (!listeners.includes(listener)) {
                    listeners.push(listener);
                }

                return this;
            };

            proto.once = function(eventName, listener) {
                if (!eventName || !listener) return this;

                // add event
                this.on(eventName, listener);
                // set once flag
                // set onceEvents hash
                let onceEvents = this._onceEvents = this._onceEvents || {};
                // set onceListeners object
                let onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
                // set flag
                onceListeners[listener] = true;

                return this;
            };

            proto.off = function(eventName, listener) {
                let listeners = this._events && this._events[eventName];
                if (!listeners || !listeners.length) return this;

                let index = listeners.indexOf(listener);
                if (index != -1) {
                    listeners.splice(index, 1);
                }

                return this;
            };

            proto.emitEvent = function(eventName, args) {
                let listeners = this._events && this._events[eventName];
                if (!listeners || !listeners.length) return this;

                // copy over to avoid interference if .off() in listener
                listeners = listeners.slice(0);
                args = args || [];
                // once stuff
                let onceListeners = this._onceEvents && this._onceEvents[eventName];

                for (let listener of listeners) {
                    let isOnce = onceListeners && onceListeners[listener];
                    if (isOnce) {
                        // remove listener
                        // remove before trigger to prevent recursion
                        this.off(eventName, listener);
                        // unset once flag
                        delete onceListeners[listener];
                    }
                    // trigger listener
                    listener.apply(this, args);
                }

                return this;
            };

            proto.allOff = function() {
                delete this._events;
                delete this._onceEvents;
                return this;
            };

            return EvEmitter;

        }));

    }, {}],
    2: [function(require, module, exports) {
        /**
         * Fizzy UI utils v3.0.0
         * MIT license
         */

        (function(global, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(global);
            } else {
                // browser global
                global.fizzyUIUtils = factory(global);
            }

        }(this, function factory(global) {

            let utils = {};

            // ----- extend ----- //

            // extends objects
            utils.extend = function(a, b) {
                return Object.assign(a, b);
            };

            // ----- modulo ----- //

            utils.modulo = function(num, div) {
                return ((num % div) + div) % div;
            };

            // ----- makeArray ----- //

            // turn element or nodeList into an array
            utils.makeArray = function(obj) {
                // use object if already an array
                if (Array.isArray(obj)) return obj;

                // return empty array if undefined or null. #6
                if (obj === null || obj === undefined) return [];

                let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
                // convert nodeList to array
                if (isArrayLike) return [...obj];

                // array of single index
                return [obj];
            };

            // ----- removeFrom ----- //

            utils.removeFrom = function(ary, obj) {
                let index = ary.indexOf(obj);
                if (index != -1) {
                    ary.splice(index, 1);
                }
            };

            // ----- getParent ----- //

            utils.getParent = function(elem, selector) {
                while (elem.parentNode && elem != document.body) {
                    elem = elem.parentNode;
                    if (elem.matches(selector)) return elem;
                }
            };

            // ----- getQueryElement ----- //

            // use element as selector string
            utils.getQueryElement = function(elem) {
                if (typeof elem == 'string') {
                    return document.querySelector(elem);
                }
                return elem;
            };

            // ----- handleEvent ----- //

            // enable .ontype to trigger from .addEventListener( elem, 'type' )
            utils.handleEvent = function(event) {
                let method = 'on' + event.type;
                if (this[method]) {
                    this[method](event);
                }
            };

            // ----- filterFindElements ----- //

            utils.filterFindElements = function(elems, selector) {
                // make array of elems
                elems = utils.makeArray(elems);

                return elems
                    // check that elem is an actual element
                    .filter((elem) => elem instanceof HTMLElement)
                    .reduce((ffElems, elem) => {
                        // add elem if no selector
                        if (!selector) {
                            ffElems.push(elem);
                            return ffElems;
                        }
                        // filter & find items if we have a selector
                        // filter
                        if (elem.matches(selector)) {
                            ffElems.push(elem);
                        }
                        // find children
                        let childElems = elem.querySelectorAll(selector);
                        // concat childElems to filterFound array
                        ffElems = ffElems.concat(...childElems);
                        return ffElems;
                    }, []);
            };

            // ----- debounceMethod ----- //

            utils.debounceMethod = function(_class, methodName, threshold) {
                threshold = threshold || 100;
                // original method
                let method = _class.prototype[methodName];
                let timeoutName = methodName + 'Timeout';

                _class.prototype[methodName] = function() {
                    clearTimeout(this[timeoutName]);

                    let args = arguments;
                    this[timeoutName] = setTimeout(() => {
                        method.apply(this, args);
                        delete this[timeoutName];
                    }, threshold);
                };
            };

            // ----- docReady ----- //

            utils.docReady = function(onDocReady) {
                let readyState = document.readyState;
                if (readyState == 'complete' || readyState == 'interactive') {
                    // do async to allow for other scripts to run. metafizzy/flickity#441
                    setTimeout(onDocReady);
                } else {
                    document.addEventListener('DOMContentLoaded', onDocReady);
                }
            };

            // ----- htmlInit ----- //

            // http://bit.ly/3oYLusc
            utils.toDashed = function(str) {
                return str.replace(/(.)([A-Z])/g, function(match, $1, $2) {
                    return $1 + '-' + $2;
                }).toLowerCase();
            };

            let console = global.console;

            // allow user to initialize classes via [data-namespace] or .js-namespace class
            // htmlInit( Widget, 'widgetName' )
            // options are parsed from data-namespace-options
            utils.htmlInit = function(WidgetClass, namespace) {
                utils.docReady(function() {
                    let dashedNamespace = utils.toDashed(namespace);
                    let dataAttr = 'data-' + dashedNamespace;
                    let dataAttrElems = document.querySelectorAll(`[${dataAttr}]`);
                    let jQuery = global.jQuery;

                    [...dataAttrElems].forEach((elem) => {
                        let attr = elem.getAttribute(dataAttr);
                        let options;
                        try {
                            options = attr && JSON.parse(attr);
                        } catch (error) {
                            // log error, do not initialize
                            if (console) {
                                console.error(`Error parsing ${dataAttr} on ${elem.className}: ${error}`);
                            }
                            return;
                        }
                        // initialize
                        let instance = new WidgetClass(elem, options);
                        // make available via $().data('namespace')
                        if (jQuery) {
                            jQuery.data(elem, namespace, instance);
                        }
                    });

                });
            };

            // -----  ----- //

            return utils;

        }));

    }, {}],
    3: [function(require, module, exports) {
        // add, remove cell
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    require('./core'),
                    require('fizzy-ui-utils'),
                );
            } else {
                // browser global
                factory(
                    window.Flickity,
                    window.fizzyUIUtils,
                );
            }

        }(typeof window != 'undefined' ? window : this, function factory(Flickity, utils) {

            // append cells to a document fragment
            function getCellsFragment(cells) {
                let fragment = document.createDocumentFragment();
                cells.forEach((cell) => fragment.appendChild(cell.element));
                return fragment;
            }

            // -------------------------- add/remove cell prototype -------------------------- //

            let proto = Flickity.prototype;

            /**
             * Insert, prepend, or append cells
             * @param {[Element, Array, NodeList]} elems - Elements to insert
             * @param {Integer} index - Zero-based number to insert
             */
            proto.insert = function(elems, index) {
                let cells = this._makeCells(elems);
                if (!cells || !cells.length) return;

                let len = this.cells.length;
                // default to append
                index = index === undefined ? len : index;
                // add cells with document fragment
                let fragment = getCellsFragment(cells);
                // append to slider
                let isAppend = index === len;
                if (isAppend) {
                    this.slider.appendChild(fragment);
                } else {
                    let insertCellElement = this.cells[index].element;
                    this.slider.insertBefore(fragment, insertCellElement);
                }
                // add to this.cells
                if (index === 0) {
                    // prepend, add to start
                    this.cells = cells.concat(this.cells);
                } else if (isAppend) {
                    // append, add to end
                    this.cells = this.cells.concat(cells);
                } else {
                    // insert in this.cells
                    let endCells = this.cells.splice(index, len - index);
                    this.cells = this.cells.concat(cells).concat(endCells);
                }

                this._sizeCells(cells);
                this.cellChange(index);
                this.positionSliderAtSelected();
            };

            proto.append = function(elems) {
                this.insert(elems, this.cells.length);
            };

            proto.prepend = function(elems) {
                this.insert(elems, 0);
            };

            /**
             * Remove cells
             * @param {[Element, Array, NodeList]} elems - ELements to remove
             */
            proto.remove = function(elems) {
                let cells = this.getCells(elems);
                if (!cells || !cells.length) return;

                let minCellIndex = this.cells.length - 1;
                // remove cells from collection & DOM
                cells.forEach((cell) => {
                    cell.remove();
                    let index = this.cells.indexOf(cell);
                    minCellIndex = Math.min(index, minCellIndex);
                    utils.removeFrom(this.cells, cell);
                });

                this.cellChange(minCellIndex);
                this.positionSliderAtSelected();
            };

            /**
             * logic to be run after a cell's size changes
             * @param {Element} elem - cell's element
             */
            proto.cellSizeChange = function(elem) {
                let cell = this.getCell(elem);
                if (!cell) return;

                cell.getSize();

                let index = this.cells.indexOf(cell);
                this.cellChange(index);
                // do not position slider after lazy load
            };

            /**
             * logic any time a cell is changed: added, removed, or size changed
             * @param {Integer} changedCellIndex - index of the changed cell, optional
             */
            proto.cellChange = function(changedCellIndex) {
                let prevSelectedElem = this.selectedElement;
                this._positionCells(changedCellIndex);
                this._updateWrapShiftCells();
                this.setGallerySize();
                // update selectedIndex, try to maintain position & select previous selected element
                let cell = this.getCell(prevSelectedElem);
                if (cell) this.selectedIndex = this.getCellSlideIndex(cell);
                this.selectedIndex = Math.min(this.slides.length - 1, this.selectedIndex);

                this.emitEvent('cellChange', [changedCellIndex]);
                // position slider
                this.select(this.selectedIndex);
            };

            // -----  ----- //

            return Flickity;

        }));

    }, {
        "./core": 6,
        "fizzy-ui-utils": 2
    }],
    4: [function(require, module, exports) {
        // animate
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(require('fizzy-ui-utils'));
            } else {
                // browser global
                window.Flickity = window.Flickity || {};
                window.Flickity.animatePrototype = factory(window.fizzyUIUtils);
            }

        }(typeof window != 'undefined' ? window : this, function factory(utils) {

            // -------------------------- animate -------------------------- //

            let proto = {};

            proto.startAnimation = function() {
                if (this.isAnimating) return;

                this.isAnimating = true;
                this.restingFrames = 0;
                this.animate();
            };

            proto.animate = function() {
                this.applyDragForce();
                this.applySelectedAttraction();

                let previousX = this.x;

                this.integratePhysics();
                this.positionSlider();
                this.settle(previousX);
                // animate next frame
                if (this.isAnimating) requestAnimationFrame(() => this.animate());
            };

            proto.positionSlider = function() {
                let x = this.x;
                // wrap position around
                if (this.isWrapping) {
                    x = utils.modulo(x, this.slideableWidth) - this.slideableWidth;
                    this.shiftWrapCells(x);
                }

                this.setTranslateX(x, this.isAnimating);
                this.dispatchScrollEvent();
            };

            proto.setTranslateX = function(x, is3d) {
                x += this.cursorPosition;
                // reverse if right-to-left and using transform
                if (this.options.rightToLeft) x = -x;
                let translateX = this.getPositionValue(x);
                // use 3D transforms for hardware acceleration on iOS
                // but use 2D when settled, for better font-rendering
                this.slider.style.transform = is3d ?
                    `translate3d(${translateX},0,0)` : `translateX(${translateX})`;
            };

            proto.dispatchScrollEvent = function() {
                let firstSlide = this.slides[0];
                if (!firstSlide) return;

                let positionX = -this.x - firstSlide.target;
                let progress = positionX / this.slidesWidth;
                this.dispatchEvent('scroll', null, [progress, positionX]);
            };

            proto.positionSliderAtSelected = function() {
                if (!this.cells.length) return;

                this.x = -this.selectedSlide.target;
                this.velocity = 0; // stop wobble
                this.positionSlider();
            };

            proto.getPositionValue = function(position) {
                if (this.options.percentPosition) {
                    // percent position, round to 2 digits, like 12.34%
                    return (Math.round((position / this.size.innerWidth) * 10000) * 0.01) + '%';
                } else {
                    // pixel positioning
                    return Math.round(position) + 'px';
                }
            };

            proto.settle = function(previousX) {
                // keep track of frames where x hasn't moved
                let isResting = !this.isPointerDown &&
                    Math.round(this.x * 100) === Math.round(previousX * 100);
                if (isResting) this.restingFrames++;
                // stop animating if resting for 3 or more frames
                if (this.restingFrames > 2) {
                    this.isAnimating = false;
                    delete this.isFreeScrolling;
                    // render position with translateX when settled
                    this.positionSlider();
                    this.dispatchEvent('settle', null, [this.selectedIndex]);
                }
            };

            proto.shiftWrapCells = function(x) {
                // shift before cells
                let beforeGap = this.cursorPosition + x;
                this._shiftCells(this.beforeShiftCells, beforeGap, -1);
                // shift after cells
                let afterGap = this.size.innerWidth - (x + this.slideableWidth + this.cursorPosition);
                this._shiftCells(this.afterShiftCells, afterGap, 1);
            };

            proto._shiftCells = function(cells, gap, shift) {
                cells.forEach((cell) => {
                    let cellShift = gap > 0 ? shift : 0;
                    this._wrapShiftCell(cell, cellShift);
                    gap -= cell.size.outerWidth;
                });
            };

            proto._unshiftCells = function(cells) {
                if (!cells || !cells.length) return;

                cells.forEach((cell) => this._wrapShiftCell(cell, 0));
            };

            // @param {Integer} shift - 0, 1, or -1
            proto._wrapShiftCell = function(cell, shift) {
                this._renderCellPosition(cell, cell.x + this.slideableWidth * shift);
            };

            // -------------------------- physics -------------------------- //

            proto.integratePhysics = function() {
                this.x += this.velocity;
                this.velocity *= this.getFrictionFactor();
            };

            proto.applyForce = function(force) {
                this.velocity += force;
            };

            proto.getFrictionFactor = function() {
                return 1 - this.options[this.isFreeScrolling ? 'freeScrollFriction' : 'friction'];
            };

            proto.getRestingPosition = function() {
                // my thanks to Steven Wittens, who simplified this math greatly
                return this.x + this.velocity / (1 - this.getFrictionFactor());
            };

            proto.applyDragForce = function() {
                if (!this.isDraggable || !this.isPointerDown) return;

                // change the position to drag position by applying force
                let dragVelocity = this.dragX - this.x;
                let dragForce = dragVelocity - this.velocity;
                this.applyForce(dragForce);
            };

            proto.applySelectedAttraction = function() {
                // do not attract if pointer down or no slides
                let dragDown = this.isDraggable && this.isPointerDown;
                if (dragDown || this.isFreeScrolling || !this.slides.length) return;

                let distance = this.selectedSlide.target * -1 - this.x;
                let force = distance * this.options.selectedAttraction;
                this.applyForce(force);
            };

            return proto;

        }));

    }, {
        "fizzy-ui-utils": 2
    }],
    5: [function(require, module, exports) {
        // Flickity.Cell
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(require('get-size'));
            } else {
                // browser global
                window.Flickity = window.Flickity || {};
                window.Flickity.Cell = factory(window.getSize);
            }

        }(typeof window != 'undefined' ? window : this, function factory(getSize) {

            const cellClassName = 'flickity-cell';

            function Cell(elem) {
                this.element = elem;
                this.element.classList.add(cellClassName);

                this.x = 0;
                this.unselect();
            }

            let proto = Cell.prototype;

            proto.destroy = function() {
                // reset style
                this.unselect();
                this.element.classList.remove(cellClassName);
                this.element.style.transform = '';
                this.element.removeAttribute('aria-hidden');
            };

            proto.getSize = function() {
                this.size = getSize(this.element);
            };

            proto.select = function() {
                this.element.classList.add('is-selected');
                this.element.removeAttribute('aria-hidden');
            };

            proto.unselect = function() {
                this.element.classList.remove('is-selected');
                this.element.setAttribute('aria-hidden', 'true');
            };

            proto.remove = function() {
                this.element.remove();
            };

            return Cell;

        }));

    }, {
        "get-size": 15
    }],
    6: [function(require, module, exports) {
        // Flickity main
        /* eslint-disable max-params */
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    window,
                    require('ev-emitter'),
                    require('get-size'),
                    require('fizzy-ui-utils'),
                    require('./cell'),
                    require('./slide'),
                    require('./animate'),
                );
            } else {
                // browser global
                let _Flickity = window.Flickity;

                window.Flickity = factory(
                    window,
                    window.EvEmitter,
                    window.getSize,
                    window.fizzyUIUtils,
                    _Flickity.Cell,
                    _Flickity.Slide,
                    _Flickity.animatePrototype,
                );
            }

        }(typeof window != 'undefined' ? window : this,
            function factory(window, EvEmitter, getSize, utils, Cell, Slide, animatePrototype) {
                /* eslint-enable max-params */

                // vars
                const {
                    getComputedStyle,
                    console
                } = window;
                let {
                    jQuery
                } = window;

                // -------------------------- Flickity -------------------------- //

                // globally unique identifiers
                let GUID = 0;
                // internal store of all Flickity intances
                let instances = {};

                function Flickity(element, options) {
                    let queryElement = utils.getQueryElement(element);
                    if (!queryElement) {
                        if (console) console.error(`Bad element for Flickity: ${queryElement || element}`);
                        return;
                    }
                    this.element = queryElement;
                    // do not initialize twice on same element
                    if (this.element.flickityGUID) {
                        let instance = instances[this.element.flickityGUID];
                        if (instance) instance.option(options);
                        return instance;
                    }

                    // add jQuery
                    if (jQuery) {
                        this.$element = jQuery(this.element);
                    }
                    // options
                    this.options = {
                        ...this.constructor.defaults
                    };
                    this.option(options);

                    // kick things off
                    this._create();
                }

                Flickity.defaults = {
                    accessibility: true,
                    // adaptiveHeight: false,
                    cellAlign: 'center',
                    // cellSelector: undefined,
                    // contain: false,
                    freeScrollFriction: 0.075, // friction when free-scrolling
                    friction: 0.28, // friction when selecting
                    namespaceJQueryEvents: true,
                    // initialIndex: 0,
                    percentPosition: true,
                    resize: true,
                    selectedAttraction: 0.025,
                    setGallerySize: true,
                    // watchCSS: false,
                    // wrapAround: false
                };

                // hash of methods triggered on _create()
                Flickity.create = {};

                let proto = Flickity.prototype;
                // inherit EventEmitter
                Object.assign(proto, EvEmitter.prototype);

                proto._create = function() {
                    let {
                        resize,
                        watchCSS,
                        rightToLeft
                    } = this.options;
                    // add id for Flickity.data
                    let id = this.guid = ++GUID;
                    this.element.flickityGUID = id; // expando
                    instances[id] = this; // associate via id
                    // initial properties
                    this.selectedIndex = 0;
                    // how many frames slider has been in same position
                    this.restingFrames = 0;
                    // initial physics properties
                    this.x = 0;
                    this.velocity = 0;
                    this.beginMargin = rightToLeft ? 'marginRight' : 'marginLeft';
                    this.endMargin = rightToLeft ? 'marginLeft' : 'marginRight';
                    // create viewport & slider
                    this.viewport = document.createElement('div');
                    this.viewport.className = 'flickity-viewport';
                    this._createSlider();
                    // used for keyboard navigation
                    this.focusableElems = [this.element];

                    if (resize || watchCSS) {
                        window.addEventListener('resize', this);
                    }

                    // add listeners from on option
                    for (let eventName in this.options.on) {
                        let listener = this.options.on[eventName];
                        this.on(eventName, listener);
                    }

                    for (let method in Flickity.create) {
                        Flickity.create[method].call(this);
                    }

                    if (watchCSS) {
                        this.watchCSS();
                    } else {
                        this.activate();
                    }
                };

                /**
                 * set options
                 * @param {Object} opts - options to extend
                 */
                proto.option = function(opts) {
                    Object.assign(this.options, opts);
                };

                proto.activate = function() {
                    if (this.isActive) return;

                    this.isActive = true;
                    this.element.classList.add('flickity-enabled');
                    if (this.options.rightToLeft) {
                        this.element.classList.add('flickity-rtl');
                    }

                    this.getSize();
                    // move initial cell elements so they can be loaded as cells
                    let cellElems = this._filterFindCellElements(this.element.children);
                    this.slider.append(...cellElems);
                    this.viewport.append(this.slider);
                    this.element.append(this.viewport);
                    // get cells from children
                    this.reloadCells();

                    if (this.options.accessibility) {
                        // allow element to focusable
                        this.element.tabIndex = 0;
                        // listen for key presses
                        this.element.addEventListener('keydown', this);
                    }

                    this.emitEvent('activate');
                    this.selectInitialIndex();
                    // flag for initial activation, for using initialIndex
                    this.isInitActivated = true;
                    // ready event. #493
                    this.dispatchEvent('ready');
                };

                // slider positions the cells
                proto._createSlider = function() {
                    // slider element does all the positioning
                    let slider = document.createElement('div');
                    slider.className = 'flickity-slider';
                    this.slider = slider;
                };

                proto._filterFindCellElements = function(elems) {
                    return utils.filterFindElements(elems, this.options.cellSelector);
                };

                // goes through all children
                proto.reloadCells = function() {
                    // collection of item elements
                    this.cells = this._makeCells(this.slider.children);
                    this.positionCells();
                    this._updateWrapShiftCells();
                    this.setGallerySize();
                };

                /**
                 * turn elements into Flickity.Cells
                 * @param {[Array, NodeList, HTMLElement]} elems - elements to make into cells
                 * @returns {Array} items - collection of new Flickity Cells
                 */
                proto._makeCells = function(elems) {
                    let cellElems = this._filterFindCellElements(elems);

                    // create new Cells for collection
                    return cellElems.map((cellElem) => new Cell(cellElem));
                };

                proto.getLastCell = function() {
                    return this.cells[this.cells.length - 1];
                };

                proto.getLastSlide = function() {
                    return this.slides[this.slides.length - 1];
                };

                // positions all cells
                proto.positionCells = function() {
                    // size all cells
                    this._sizeCells(this.cells);
                    // position all cells
                    this._positionCells(0);
                };

                /**
                 * position certain cells
                 * @param {Integer} index - which cell to start with
                 */
                proto._positionCells = function(index) {
                    index = index || 0;
                    // also measure maxCellHeight
                    // start 0 if positioning all cells
                    this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
                    let cellX = 0;
                    // get cellX
                    if (index > 0) {
                        let startCell = this.cells[index - 1];
                        cellX = startCell.x + startCell.size.outerWidth;
                    }

                    this.cells.slice(index).forEach((cell) => {
                        cell.x = cellX;
                        this._renderCellPosition(cell, cellX);
                        cellX += cell.size.outerWidth;
                        this.maxCellHeight = Math.max(cell.size.outerHeight, this.maxCellHeight);
                    });
                    // keep track of cellX for wrap-around
                    this.slideableWidth = cellX;
                    // slides
                    this.updateSlides();
                    // contain slides target
                    this._containSlides();
                    // update slidesWidth
                    this.slidesWidth = this.cells.length ?
                        this.getLastSlide().target - this.slides[0].target : 0;
                };

                proto._renderCellPosition = function(cell, x) {
                    // render position of cell with in slider
                    let sideOffset = this.options.rightToLeft ? -1 : 1;
                    let renderX = x * sideOffset;
                    if (this.options.percentPosition) renderX *= this.size.innerWidth / cell.size.width;
                    let positionValue = this.getPositionValue(renderX);
                    cell.element.style.transform = `translateX( ${positionValue} )`;
                };

                /**
                 * cell.getSize() on multiple cells
                 * @param {Array} cells - cells to size
                 */
                proto._sizeCells = function(cells) {
                    cells.forEach((cell) => cell.getSize());
                };

                // --------------------------  -------------------------- //

                proto.updateSlides = function() {
                    this.slides = [];
                    if (!this.cells.length) return;

                    let {
                        beginMargin,
                        endMargin
                    } = this;
                    let slide = new Slide(beginMargin, endMargin, this.cellAlign);
                    this.slides.push(slide);

                    let canCellFit = this._getCanCellFit();

                    this.cells.forEach((cell, i) => {
                        // just add cell if first cell in slide
                        if (!slide.cells.length) {
                            slide.addCell(cell);
                            return;
                        }

                        let slideWidth = (slide.outerWidth - slide.firstMargin) +
                            (cell.size.outerWidth - cell.size[endMargin]);

                        if (canCellFit(i, slideWidth)) {
                            slide.addCell(cell);
                        } else {
                            // doesn't fit, new slide
                            slide.updateTarget();

                            slide = new Slide(beginMargin, endMargin, this.cellAlign);
                            this.slides.push(slide);
                            slide.addCell(cell);
                        }
                    });
                    // last slide
                    slide.updateTarget();
                    // update .selectedSlide
                    this.updateSelectedSlide();
                };

                proto._getCanCellFit = function() {
                    let {
                        groupCells
                    } = this.options;
                    if (!groupCells) return () => false;

                    if (typeof groupCells == 'number') {
                        // group by number. 3 -> [0,1,2], [3,4,5], ...
                        let number = parseInt(groupCells, 10);
                        return (i) => (i % number) !== 0;
                    }
                    // default, group by width of slide
                    let percent = 1;
                    // parse '75%
                    let percentMatch = typeof groupCells == 'string' && groupCells.match(/^(\d+)%$/);
                    if (percentMatch) percent = parseInt(percentMatch[1], 10) / 100;
                    let groupWidth = (this.size.innerWidth + 1) * percent;
                    return (i, slideWidth) => slideWidth <= groupWidth;
                };

                // alias _init for jQuery plugin .flickity()
                proto._init =
                    proto.reposition = function() {
                        this.positionCells();
                        this.positionSliderAtSelected();
                    };

                proto.getSize = function() {
                    this.size = getSize(this.element);
                    this.setCellAlign();
                    this.cursorPosition = this.size.innerWidth * this.cellAlign;
                };

                let cellAlignShorthands = {
                    left: 0,
                    center: 0.5,
                    right: 1,
                };

                proto.setCellAlign = function() {
                    let {
                        cellAlign,
                        rightToLeft
                    } = this.options;
                    let shorthand = cellAlignShorthands[cellAlign];
                    this.cellAlign = shorthand !== undefined ? shorthand : cellAlign;
                    if (rightToLeft) this.cellAlign = 1 - this.cellAlign;
                };

                proto.setGallerySize = function() {
                    if (!this.options.setGallerySize) return;

                    let height = this.options.adaptiveHeight && this.selectedSlide ?
                        this.selectedSlide.height : this.maxCellHeight;
                    this.viewport.style.height = `${height}px`;
                };

                proto._updateWrapShiftCells = function() {
                    // update isWrapping
                    this.isWrapping = this.getIsWrapping();
                    // only for wrap-around
                    if (!this.isWrapping) return;

                    // unshift previous cells
                    this._unshiftCells(this.beforeShiftCells);
                    this._unshiftCells(this.afterShiftCells);
                    // get before cells
                    // initial gap
                    let beforeGapX = this.cursorPosition;
                    let lastIndex = this.cells.length - 1;
                    this.beforeShiftCells = this._getGapCells(beforeGapX, lastIndex, -1);
                    // get after cells
                    // ending gap between last cell and end of gallery viewport
                    let afterGapX = this.size.innerWidth - this.cursorPosition;
                    // start cloning at first cell, working forwards
                    this.afterShiftCells = this._getGapCells(afterGapX, 0, 1);
                };

                proto.getIsWrapping = function() {
                    let {
                        wrapAround
                    } = this.options;
                    if (!wrapAround || this.slides.length < 2) return false;

                    if (wrapAround !== 'fill') return true;
                    // check that slides can fit

                    let gapWidth = this.slideableWidth - this.size.innerWidth;
                    if (gapWidth > this.size.innerWidth) return true; // gap * 2x big, all good
                    // check that content width - shifting cell is bigger than viewport width
                    for (let cell of this.cells) {
                        if (cell.size.outerWidth > gapWidth) return false;
                    }
                    return true;
                };

                proto._getGapCells = function(gapX, cellIndex, increment) {
                    // keep adding cells until the cover the initial gap
                    let cells = [];
                    while (gapX > 0) {
                        let cell = this.cells[cellIndex];
                        if (!cell) break;

                        cells.push(cell);
                        cellIndex += increment;
                        gapX -= cell.size.outerWidth;
                    }
                    return cells;
                };

                // ----- contain & wrap ----- //

                // contain cell targets so no excess sliding
                proto._containSlides = function() {
                    let isContaining = this.options.contain && !this.isWrapping &&
                        this.cells.length;
                    if (!isContaining) return;

                    let contentWidth = this.slideableWidth - this.getLastCell().size[this.endMargin];
                    // content is less than gallery size
                    let isContentSmaller = contentWidth < this.size.innerWidth;
                    if (isContentSmaller) {
                        // all cells fit inside gallery
                        this.slides.forEach((slide) => {
                            slide.target = contentWidth * this.cellAlign;
                        });
                    } else {
                        // contain to bounds
                        let beginBound = this.cursorPosition + this.cells[0].size[this.beginMargin];
                        let endBound = contentWidth - this.size.innerWidth * (1 - this.cellAlign);
                        this.slides.forEach((slide) => {
                            slide.target = Math.max(slide.target, beginBound);
                            slide.target = Math.min(slide.target, endBound);
                        });
                    }
                };

                // ----- events ----- //

                /**
                 * emits events via eventEmitter and jQuery events
                 * @param {String} type - name of event
                 * @param {Event} event - original event
                 * @param {Array} args - extra arguments
                 */
                proto.dispatchEvent = function(type, event, args) {
                    let emitArgs = event ? [event].concat(args) : args;
                    this.emitEvent(type, emitArgs);

                    if (jQuery && this.$element) {
                        // default trigger with type if no event
                        type += this.options.namespaceJQueryEvents ? '.flickity' : '';
                        let $event = type;
                        if (event) {
                            // create jQuery event
                            let jQEvent = new jQuery.Event(event);
                            jQEvent.type = type;
                            $event = jQEvent;
                        }
                        this.$element.trigger($event, args);
                    }
                };

                const unidraggerEvents = [
                    'dragStart',
                    'dragMove',
                    'dragEnd',
                    'pointerDown',
                    'pointerMove',
                    'pointerEnd',
                    'staticClick',
                ];

                let _emitEvent = proto.emitEvent;
                proto.emitEvent = function(eventName, args) {
                    if (eventName === 'staticClick') {
                        // add cellElem and cellIndex args to staticClick
                        let clickedCell = this.getParentCell(args[0].target);
                        let cellElem = clickedCell && clickedCell.element;
                        let cellIndex = clickedCell && this.cells.indexOf(clickedCell);
                        args = args.concat(cellElem, cellIndex);
                    }
                    // do regular thing
                    _emitEvent.call(this, eventName, args);
                    // duck-punch in jQuery events for Unidragger events
                    let isUnidraggerEvent = unidraggerEvents.includes(eventName);
                    if (!isUnidraggerEvent || !jQuery || !this.$element) return;

                    eventName += this.options.namespaceJQueryEvents ? '.flickity' : '';
                    let event = args.shift(0);
                    let jQEvent = new jQuery.Event(event);
                    jQEvent.type = eventName;
                    this.$element.trigger(jQEvent, args);
                };

                // -------------------------- select -------------------------- //

                /**
                 * @param {Integer} index - index of the slide
                 * @param {Boolean} isWrap - will wrap-around to last/first if at the end
                 * @param {Boolean} isInstant - will immediately set position at selected cell
                 */
                proto.select = function(index, isWrap, isInstant) {
                    if (!this.isActive) return;

                    index = parseInt(index, 10);
                    this._wrapSelect(index);

                    if (this.isWrapping || isWrap) {
                        index = utils.modulo(index, this.slides.length);
                    }
                    // bail if invalid index
                    if (!this.slides[index]) return;

                    let prevIndex = this.selectedIndex;
                    this.selectedIndex = index;
                    this.updateSelectedSlide();
                    if (isInstant) {
                        this.positionSliderAtSelected();
                    } else {
                        this.startAnimation();
                    }
                    if (this.options.adaptiveHeight) {
                        this.setGallerySize();
                    }
                    // events
                    this.dispatchEvent('select', null, [index]);
                    // change event if new index
                    if (index !== prevIndex) {
                        this.dispatchEvent('change', null, [index]);
                    }
                };

                // wraps position for wrapAround, to move to closest slide. #113
                proto._wrapSelect = function(index) {
                    if (!this.isWrapping) return;

                    const {
                        selectedIndex,
                        slideableWidth,
                        slides: {
                            length
                        }
                    } = this;
                    // shift index for wrap, do not wrap dragSelect
                    if (!this.isDragSelect) {
                        let wrapIndex = utils.modulo(index, length);
                        // go to shortest
                        let delta = Math.abs(wrapIndex - selectedIndex);
                        let backWrapDelta = Math.abs((wrapIndex + length) - selectedIndex);
                        let forewardWrapDelta = Math.abs((wrapIndex - length) - selectedIndex);
                        if (backWrapDelta < delta) {
                            index += length;
                        } else if (forewardWrapDelta < delta) {
                            index -= length;
                        }
                    }

                    // wrap position so slider is within normal area
                    if (index < 0) {
                        this.x -= slideableWidth;
                    } else if (index >= length) {
                        this.x += slideableWidth;
                    }
                };

                proto.previous = function(isWrap, isInstant) {
                    this.select(this.selectedIndex - 1, isWrap, isInstant);
                };

                proto.next = function(isWrap, isInstant) {
                    this.select(this.selectedIndex + 1, isWrap, isInstant);
                };

                proto.updateSelectedSlide = function() {
                    let slide = this.slides[this.selectedIndex];
                    // selectedIndex could be outside of slides, if triggered before resize()
                    if (!slide) return;

                    // unselect previous selected slide
                    this.unselectSelectedSlide();
                    // update new selected slide
                    this.selectedSlide = slide;
                    slide.select();
                    this.selectedCells = slide.cells;
                    this.selectedElements = slide.getCellElements();
                    // HACK: selectedCell & selectedElement is first cell in slide, backwards compatibility
                    this.selectedCell = slide.cells[0];
                    this.selectedElement = this.selectedElements[0];
                };

                proto.unselectSelectedSlide = function() {
                    if (this.selectedSlide) this.selectedSlide.unselect();
                };

                proto.selectInitialIndex = function() {
                    let initialIndex = this.options.initialIndex;
                    // already activated, select previous selectedIndex
                    if (this.isInitActivated) {
                        this.select(this.selectedIndex, false, true);
                        return;
                    }
                    // select with selector string
                    if (initialIndex && typeof initialIndex == 'string') {
                        let cell = this.queryCell(initialIndex);
                        if (cell) {
                            this.selectCell(initialIndex, false, true);
                            return;
                        }
                    }

                    let index = 0;
                    // select with number
                    if (initialIndex && this.slides[initialIndex]) {
                        index = initialIndex;
                    }
                    // select instantly
                    this.select(index, false, true);
                };

                /**
                 * select slide from number or cell element
                 * @param {[Element, Number]} value - zero-based index or element to select
                 * @param {Boolean} isWrap - enables wrapping around for extra index
                 * @param {Boolean} isInstant - disables slide animation
                 */
                proto.selectCell = function(value, isWrap, isInstant) {
                    // get cell
                    let cell = this.queryCell(value);
                    if (!cell) return;

                    let index = this.getCellSlideIndex(cell);
                    this.select(index, isWrap, isInstant);
                };

                proto.getCellSlideIndex = function(cell) {
                    // get index of slide that has cell
                    let cellSlide = this.slides.find((slide) => slide.cells.includes(cell));
                    return this.slides.indexOf(cellSlide);
                };

                // -------------------------- get cells -------------------------- //

                /**
                 * get Flickity.Cell, given an Element
                 * @param {Element} elem - matching cell element
                 * @returns {Flickity.Cell} cell - matching cell
                 */
                proto.getCell = function(elem) {
                    // loop through cells to get the one that matches
                    for (let cell of this.cells) {
                        if (cell.element === elem) return cell;
                    }
                };

                /**
                 * get collection of Flickity.Cells, given Elements
                 * @param {[Element, Array, NodeList]} elems - multiple elements
                 * @returns {Array} cells - Flickity.Cells
                 */
                proto.getCells = function(elems) {
                    elems = utils.makeArray(elems);
                    return elems.map((elem) => this.getCell(elem)).filter(Boolean);
                };

                /**
                 * get cell elements
                 * @returns {Array} cellElems
                 */
                proto.getCellElements = function() {
                    return this.cells.map((cell) => cell.element);
                };

                /**
                 * get parent cell from an element
                 * @param {Element} elem - child element
                 * @returns {Flickit.Cell} cell - parent cell
                 */
                proto.getParentCell = function(elem) {
                    // first check if elem is cell
                    let cell = this.getCell(elem);
                    if (cell) return cell;

                    // try to get parent cell elem
                    let closest = elem.closest('.flickity-slider > *');
                    return this.getCell(closest);
                };

                /**
                 * get cells adjacent to a slide
                 * @param {Integer} adjCount - number of adjacent slides
                 * @param {Integer} index - index of slide to start
                 * @returns {Array} cells - array of Flickity.Cells
                 */
                proto.getAdjacentCellElements = function(adjCount, index) {
                    if (!adjCount) return this.selectedSlide.getCellElements();

                    index = index === undefined ? this.selectedIndex : index;

                    let len = this.slides.length;
                    if (1 + (adjCount * 2) >= len) {
                        return this.getCellElements(); // get all
                    }

                    let cellElems = [];
                    for (let i = index - adjCount; i <= index + adjCount; i++) {
                        let slideIndex = this.isWrapping ? utils.modulo(i, len) : i;
                        let slide = this.slides[slideIndex];
                        if (slide) {
                            cellElems = cellElems.concat(slide.getCellElements());
                        }
                    }
                    return cellElems;
                };

                /**
                 * select slide from number or cell element
                 * @param {[Element, String, Number]} selector - element, selector string, or index
                 * @returns {Flickity.Cell} - matching cell
                 */
                proto.queryCell = function(selector) {
                    if (typeof selector == 'number') {
                        // use number as index
                        return this.cells[selector];
                    }
                    // do not select invalid selectors from hash: #123, #/. #791
                    let isSelectorString = typeof selector == 'string' && !selector.match(/^[#.]?[\d/]/);
                    if (isSelectorString) {
                        // use string as selector, get element
                        selector = this.element.querySelector(selector);
                    }
                    // get cell from element
                    return this.getCell(selector);
                };

                // -------------------------- events -------------------------- //

                proto.uiChange = function() {
                    this.emitEvent('uiChange');
                };

                // ----- resize ----- //

                proto.onresize = function() {
                    this.watchCSS();
                    this.resize();
                };

                utils.debounceMethod(Flickity, 'onresize', 150);

                proto.resize = function() {
                    // #1177 disable resize behavior when animating or dragging for iOS 15
                    if (!this.isActive || this.isAnimating || this.isDragging) return;
                    this.getSize();
                    // wrap values
                    if (this.isWrapping) {
                        this.x = utils.modulo(this.x, this.slideableWidth);
                    }
                    this.positionCells();
                    this._updateWrapShiftCells();
                    this.setGallerySize();
                    this.emitEvent('resize');
                    // update selected index for group slides, instant
                    // TODO: position can be lost between groups of various numbers
                    let selectedElement = this.selectedElements && this.selectedElements[0];
                    this.selectCell(selectedElement, false, true);
                };

                // watches the :after property, activates/deactivates
                proto.watchCSS = function() {
                    if (!this.options.watchCSS) return;

                    let afterContent = getComputedStyle(this.element, ':after').content;
                    // activate if :after { content: 'flickity' }
                    if (afterContent.includes('flickity')) {
                        this.activate();
                    } else {
                        this.deactivate();
                    }
                };

                // ----- keydown ----- //

                // go previous/next if left/right keys pressed
                proto.onkeydown = function(event) {
                    let {
                        activeElement
                    } = document;
                    let handler = Flickity.keyboardHandlers[event.key];
                    // only work if element is in focus
                    if (!this.options.accessibility || !activeElement || !handler) return;

                    let isFocused = this.focusableElems.some((elem) => activeElement === elem);
                    if (isFocused) handler.call(this);
                };

                Flickity.keyboardHandlers = {
                    ArrowLeft: function() {
                        this.uiChange();
                        let leftMethod = this.options.rightToLeft ? 'next' : 'previous';
                        this[leftMethod]();
                    },
                    ArrowRight: function() {
                        this.uiChange();
                        let rightMethod = this.options.rightToLeft ? 'previous' : 'next';
                        this[rightMethod]();
                    },
                };

                // ----- focus ----- //

                proto.focus = function() {
                    this.element.focus({
                        preventScroll: true
                    });
                };

                // -------------------------- destroy -------------------------- //

                // deactivate all Flickity functionality, but keep stuff available
                proto.deactivate = function() {
                    if (!this.isActive) return;

                    this.element.classList.remove('flickity-enabled');
                    this.element.classList.remove('flickity-rtl');
                    this.unselectSelectedSlide();
                    // destroy cells
                    this.cells.forEach((cell) => cell.destroy());
                    this.viewport.remove();
                    // move child elements back into element
                    this.element.append(...this.slider.children);
                    if (this.options.accessibility) {
                        this.element.removeAttribute('tabIndex');
                        this.element.removeEventListener('keydown', this);
                    }
                    // set flags
                    this.isActive = false;
                    this.emitEvent('deactivate');
                };

                proto.destroy = function() {
                    this.deactivate();
                    window.removeEventListener('resize', this);
                    this.allOff();
                    this.emitEvent('destroy');
                    if (jQuery && this.$element) {
                        jQuery.removeData(this.element, 'flickity');
                    }
                    delete this.element.flickityGUID;
                    delete instances[this.guid];
                };

                // -------------------------- prototype -------------------------- //

                Object.assign(proto, animatePrototype);

                // -------------------------- extras -------------------------- //

                /**
                 * get Flickity instance from element
                 * @param {[Element, String]} elem - element or selector string
                 * @returns {Flickity} - Flickity instance
                 */
                Flickity.data = function(elem) {
                    elem = utils.getQueryElement(elem);
                    if (elem) return instances[elem.flickityGUID];
                };

                utils.htmlInit(Flickity, 'flickity');

                let {
                    jQueryBridget
                } = window;
                if (jQuery && jQueryBridget) {
                    jQueryBridget('flickity', Flickity, jQuery);
                }

                // set internal jQuery, for Webpack + jQuery v3, #478
                Flickity.setJQuery = function(jq) {
                    jQuery = jq;
                };

                Flickity.Cell = Cell;
                Flickity.Slide = Slide;

                return Flickity;

            }));

    }, {
        "./animate": 4,
        "./cell": 5,
        "./slide": 14,
        "ev-emitter": 1,
        "fizzy-ui-utils": 2,
        "get-size": 15
    }],
    7: [function(require, module, exports) {
        // drag
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    window,
                    require('./core'),
                    require('unidragger'),
                    require('fizzy-ui-utils'),
                );
            } else {
                // browser global
                window.Flickity = factory(
                    window,
                    window.Flickity,
                    window.Unidragger,
                    window.fizzyUIUtils,
                );
            }

        }(typeof window != 'undefined' ? window : this,
            function factory(window, Flickity, Unidragger, utils) {

                // ----- defaults ----- //

                Object.assign(Flickity.defaults, {
                    draggable: '>1',
                    dragThreshold: 3,
                });

                // -------------------------- drag prototype -------------------------- //

                let proto = Flickity.prototype;
                Object.assign(proto, Unidragger.prototype); // inherit Unidragger
                proto.touchActionValue = '';

                // --------------------------  -------------------------- //

                Flickity.create.drag = function() {
                    this.on('activate', this.onActivateDrag);
                    this.on('uiChange', this._uiChangeDrag);
                    this.on('deactivate', this.onDeactivateDrag);
                    this.on('cellChange', this.updateDraggable);
                    this.on('pointerDown', this.handlePointerDown);
                    this.on('pointerUp', this.handlePointerUp);
                    this.on('pointerDown', this.handlePointerDone);
                    this.on('dragStart', this.handleDragStart);
                    this.on('dragMove', this.handleDragMove);
                    this.on('dragEnd', this.handleDragEnd);
                    this.on('staticClick', this.handleStaticClick);
                    // TODO updateDraggable on resize? if groupCells & slides change
                };

                proto.onActivateDrag = function() {
                    this.handles = [this.viewport];
                    this.bindHandles();
                    this.updateDraggable();
                };

                proto.onDeactivateDrag = function() {
                    this.unbindHandles();
                    this.element.classList.remove('is-draggable');
                };

                proto.updateDraggable = function() {
                    // disable dragging if less than 2 slides. #278
                    if (this.options.draggable === '>1') {
                        this.isDraggable = this.slides.length > 1;
                    } else {
                        this.isDraggable = this.options.draggable;
                    }
                    this.element.classList.toggle('is-draggable', this.isDraggable);
                };

                proto._uiChangeDrag = function() {
                    delete this.isFreeScrolling;
                };

                // -------------------------- pointer events -------------------------- //

                proto.handlePointerDown = function(event) {
                    if (!this.isDraggable) {
                        // proceed for staticClick
                        this.bindActivePointerEvents(event);
                        return;
                    }

                    let isTouchStart = event.type === 'touchstart';
                    let isTouchPointer = event.pointerType === 'touch';
                    let isFocusNode = event.target.matches('input, textarea, select');
                    if (!isTouchStart && !isTouchPointer && !isFocusNode) event.preventDefault();
                    if (!isFocusNode) this.focus();
                    // blur
                    if (document.activeElement !== this.element) document.activeElement.blur();
                    // stop if it was moving
                    this.dragX = this.x;
                    this.viewport.classList.add('is-pointer-down');
                    // track scrolling
                    this.pointerDownScroll = getScrollPosition();
                    window.addEventListener('scroll', this);
                    this.bindActivePointerEvents(event);
                };

                // ----- move ----- //

                proto.hasDragStarted = function(moveVector) {
                    return Math.abs(moveVector.x) > this.options.dragThreshold;
                };

                // ----- up ----- //

                proto.handlePointerUp = function() {
                    delete this.isTouchScrolling;
                    this.viewport.classList.remove('is-pointer-down');
                };

                proto.handlePointerDone = function() {
                    window.removeEventListener('scroll', this);
                    delete this.pointerDownScroll;
                };

                // -------------------------- dragging -------------------------- //

                proto.handleDragStart = function() {
                    if (!this.isDraggable) return;

                    this.dragStartPosition = this.x;
                    this.startAnimation();
                    window.removeEventListener('scroll', this);
                };

                proto.handleDragMove = function(event, pointer, moveVector) {
                    if (!this.isDraggable) return;

                    event.preventDefault();

                    this.previousDragX = this.dragX;
                    // reverse if right-to-left
                    let direction = this.options.rightToLeft ? -1 : 1;
                    // wrap around move. #589
                    if (this.isWrapping) moveVector.x %= this.slideableWidth;
                    let dragX = this.dragStartPosition + moveVector.x * direction;

                    if (!this.isWrapping) {
                        // slow drag
                        let originBound = Math.max(-this.slides[0].target, this.dragStartPosition);
                        dragX = dragX > originBound ? (dragX + originBound) * 0.5 : dragX;
                        let endBound = Math.min(-this.getLastSlide().target, this.dragStartPosition);
                        dragX = dragX < endBound ? (dragX + endBound) * 0.5 : dragX;
                    }

                    this.dragX = dragX;
                    this.dragMoveTime = new Date();
                };

                proto.handleDragEnd = function() {
                    if (!this.isDraggable) return;

                    let {
                        freeScroll
                    } = this.options;
                    if (freeScroll) this.isFreeScrolling = true;
                    // set selectedIndex based on where flick will end up
                    let index = this.dragEndRestingSelect();

                    if (freeScroll && !this.isWrapping) {
                        // if free-scroll & not wrap around
                        // do not free-scroll if going outside of bounding slides
                        // so bounding slides can attract slider, and keep it in bounds
                        let restingX = this.getRestingPosition();
                        this.isFreeScrolling = -restingX > this.slides[0].target &&
                            -restingX < this.getLastSlide().target;
                    } else if (!freeScroll && index === this.selectedIndex) {
                        // boost selection if selected index has not changed
                        index += this.dragEndBoostSelect();
                    }
                    delete this.previousDragX;
                    // apply selection
                    // HACK, set flag so dragging stays in correct direction
                    this.isDragSelect = this.isWrapping;
                    this.select(index);
                    delete this.isDragSelect;
                };

                proto.dragEndRestingSelect = function() {
                    let restingX = this.getRestingPosition();
                    // how far away from selected slide
                    let distance = Math.abs(this.getSlideDistance(-restingX, this.selectedIndex));
                    // get closet resting going up and going down
                    let positiveResting = this._getClosestResting(restingX, distance, 1);
                    let negativeResting = this._getClosestResting(restingX, distance, -1);
                    // use closer resting for wrap-around
                    return positiveResting.distance < negativeResting.distance ?
                        positiveResting.index : negativeResting.index;
                };

                /**
                 * given resting X and distance to selected cell
                 * get the distance and index of the closest cell
                 * @param {Number} restingX - estimated post-flick resting position
                 * @param {Number} distance - distance to selected cell
                 * @param {Integer} increment - +1 or -1, going up or down
                 * @returns {Object} - { distance: {Number}, index: {Integer} }
                 */
                proto._getClosestResting = function(restingX, distance, increment) {
                    let index = this.selectedIndex;
                    let minDistance = Infinity;
                    let condition = this.options.contain && !this.isWrapping ?
                        // if containing, keep going if distance is equal to minDistance
                        (dist, minDist) => dist <= minDist :
                        (dist, minDist) => dist < minDist;

                    while (condition(distance, minDistance)) {
                        // measure distance to next cell
                        index += increment;
                        minDistance = distance;
                        distance = this.getSlideDistance(-restingX, index);
                        if (distance === null) break;

                        distance = Math.abs(distance);
                    }
                    return {
                        distance: minDistance,
                        // selected was previous index
                        index: index - increment,
                    };
                };

                /**
                 * measure distance between x and a slide target
                 * @param {Number} x - horizontal position
                 * @param {Integer} index - slide index
                 * @returns {Number} - slide distance
                 */
                proto.getSlideDistance = function(x, index) {
                    let len = this.slides.length;
                    // wrap around if at least 2 slides
                    let isWrapAround = this.options.wrapAround && len > 1;
                    let slideIndex = isWrapAround ? utils.modulo(index, len) : index;
                    let slide = this.slides[slideIndex];
                    if (!slide) return null;

                    // add distance for wrap-around slides
                    let wrap = isWrapAround ? this.slideableWidth * Math.floor(index / len) : 0;
                    return x - (slide.target + wrap);
                };

                proto.dragEndBoostSelect = function() {
                    // do not boost if no previousDragX or dragMoveTime
                    if (this.previousDragX === undefined || !this.dragMoveTime ||
                        // or if drag was held for 100 ms
                        new Date() - this.dragMoveTime > 100) {
                        return 0;
                    }

                    let distance = this.getSlideDistance(-this.dragX, this.selectedIndex);
                    let delta = this.previousDragX - this.dragX;
                    if (distance > 0 && delta > 0) {
                        // boost to next if moving towards the right, and positive velocity
                        return 1;
                    } else if (distance < 0 && delta < 0) {
                        // boost to previous if moving towards the left, and negative velocity
                        return -1;
                    }
                    return 0;
                };

                // ----- scroll ----- //

                proto.onscroll = function() {
                    let scroll = getScrollPosition();
                    let scrollMoveX = this.pointerDownScroll.x - scroll.x;
                    let scrollMoveY = this.pointerDownScroll.y - scroll.y;
                    // cancel click/tap if scroll is too much
                    if (Math.abs(scrollMoveX) > 3 || Math.abs(scrollMoveY) > 3) {
                        this.pointerDone();
                    }
                };

                // ----- utils ----- //

                function getScrollPosition() {
                    return {
                        x: window.pageXOffset,
                        y: window.pageYOffset,
                    };
                }

                // -----  ----- //

                return Flickity;

            }));

    }, {
        "./core": 6,
        "fizzy-ui-utils": 2,
        "unidragger": 17
    }],
    8: [function(require, module, exports) {
        // imagesloaded
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    require('./core'),
                    require('imagesloaded'),
                );
            } else {
                // browser global
                factory(
                    window.Flickity,
                    window.imagesLoaded,
                );
            }

        }(typeof window != 'undefined' ? window : this,
            function factory(Flickity, imagesLoaded) {

                Flickity.create.imagesLoaded = function() {
                    this.on('activate', this.imagesLoaded);
                };

                Flickity.prototype.imagesLoaded = function() {
                    if (!this.options.imagesLoaded) return;

                    let onImagesLoadedProgress = (instance, image) => {
                        let cell = this.getParentCell(image.img);
                        this.cellSizeChange(cell && cell.element);
                        if (!this.options.freeScroll) this.positionSliderAtSelected();
                    };
                    imagesLoaded(this.slider).on('progress', onImagesLoadedProgress);
                };

                return Flickity;

            }));

    }, {
        "./core": 6,
        "imagesloaded": 16
    }],
    9: [function(require, module, exports) {
        /*!
         * Flickity v3.0.0
         * Touch, responsive, flickable carousels
         *
         * Licensed GPLv3 for open source use
         * or Flickity Commercial License for commercial use
         *
         * https://flickity.metafizzy.co
         * Copyright 2015-2022 Metafizzy
         */

        if (typeof module == 'object' && module.exports) {
            const Flickity = require('./core');
            require('./drag');
            require('./prev-next-button');
            require('./page-dots');
            require('./player');
            require('./add-remove-cell');
            require('./lazyload');
            require('./imagesloaded');

            module.exports = Flickity;
        }

    }, {
        "./add-remove-cell": 3,
        "./core": 6,
        "./drag": 7,
        "./imagesloaded": 8,
        "./lazyload": 10,
        "./page-dots": 11,
        "./player": 12,
        "./prev-next-button": 13
    }],
    10: [function(require, module, exports) {
        // lazyload
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    require('./core'),
                    require('fizzy-ui-utils'),
                );
            } else {
                // browser global
                factory(
                    window.Flickity,
                    window.fizzyUIUtils,
                );
            }

        }(typeof window != 'undefined' ? window : this, function factory(Flickity, utils) {

            const lazyAttr = 'data-flickity-lazyload';
            const lazySrcAttr = `${lazyAttr}-src`;
            const lazySrcsetAttr = `${lazyAttr}-srcset`;
            const imgSelector = `img[${lazyAttr}], img[${lazySrcAttr}], ` +
                `img[${lazySrcsetAttr}], source[${lazySrcsetAttr}]`;

            Flickity.create.lazyLoad = function() {
                this.on('select', this.lazyLoad);

                this.handleLazyLoadComplete = this.onLazyLoadComplete.bind(this);
            };

            let proto = Flickity.prototype;

            proto.lazyLoad = function() {
                let {
                    lazyLoad
                } = this.options;
                if (!lazyLoad) return;

                // get adjacent cells, use lazyLoad option for adjacent count
                let adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
                // lazy load images
                this.getAdjacentCellElements(adjCount)
                    .map(getCellLazyImages)
                    .flat()
                    .forEach((img) => new LazyLoader(img, this.handleLazyLoadComplete));
            };

            function getCellLazyImages(cellElem) {
                // check if cell element is lazy image
                if (cellElem.matches('img')) {
                    let cellAttr = cellElem.getAttribute(lazyAttr);
                    let cellSrcAttr = cellElem.getAttribute(lazySrcAttr);
                    let cellSrcsetAttr = cellElem.getAttribute(lazySrcsetAttr);
                    if (cellAttr || cellSrcAttr || cellSrcsetAttr) {
                        return cellElem;
                    }
                }
                // select lazy images in cell
                return [...cellElem.querySelectorAll(imgSelector)];
            }

            proto.onLazyLoadComplete = function(img, event) {
                let cell = this.getParentCell(img);
                let cellElem = cell && cell.element;
                this.cellSizeChange(cellElem);

                this.dispatchEvent('lazyLoad', event, cellElem);
            };

            // -------------------------- LazyLoader -------------------------- //

            /**
             * class to handle loading images
             * @param {Image} img - Image element
             * @param {Function} onComplete - callback function
             */
            function LazyLoader(img, onComplete) {
                this.img = img;
                this.onComplete = onComplete;
                this.load();
            }

            LazyLoader.prototype.handleEvent = utils.handleEvent;

            LazyLoader.prototype.load = function() {
                this.img.addEventListener('load', this);
                this.img.addEventListener('error', this);
                // get src & srcset
                let src = this.img.getAttribute(lazyAttr) ||
                    this.img.getAttribute(lazySrcAttr);
                let srcset = this.img.getAttribute(lazySrcsetAttr);
                // set src & serset
                this.img.src = src;
                if (srcset) this.img.setAttribute('srcset', srcset);
                // remove attr
                this.img.removeAttribute(lazyAttr);
                this.img.removeAttribute(lazySrcAttr);
                this.img.removeAttribute(lazySrcsetAttr);
            };

            LazyLoader.prototype.onload = function(event) {
                this.complete(event, 'flickity-lazyloaded');
            };

            LazyLoader.prototype.onerror = function(event) {
                this.complete(event, 'flickity-lazyerror');
            };

            LazyLoader.prototype.complete = function(event, className) {
                // unbind events
                this.img.removeEventListener('load', this);
                this.img.removeEventListener('error', this);
                let mediaElem = this.img.parentNode.matches('picture') ? this.img.parentNode : this.img;
                mediaElem.classList.add(className);

                this.onComplete(this.img, event);
            };

            // -----  ----- //

            Flickity.LazyLoader = LazyLoader;

            return Flickity;

        }));

    }, {
        "./core": 6,
        "fizzy-ui-utils": 2
    }],
    11: [function(require, module, exports) {
        // page dots
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    require('./core'),
                    require('fizzy-ui-utils'),
                );
            } else {
                // browser global
                factory(
                    window.Flickity,
                    window.fizzyUIUtils,
                );
            }

        }(typeof window != 'undefined' ? window : this, function factory(Flickity, utils) {

            // -------------------------- PageDots -------------------------- //

            function PageDots() {
                // create holder element
                this.holder = document.createElement('div');
                this.holder.className = 'flickity-page-dots';
                // create dots, array of elements
                this.dots = [];
            }

            PageDots.prototype.setDots = function(slidesLength) {
                // get difference between number of slides and number of dots
                let delta = slidesLength - this.dots.length;
                if (delta > 0) {
                    this.addDots(delta);
                } else if (delta < 0) {
                    this.removeDots(-delta);
                }
            };

            PageDots.prototype.addDots = function(count) {
                let newDots = new Array(count).fill()
                    .map((item, i) => {
                        let dot = document.createElement('button');
                        dot.setAttribute('type', 'button');
                        let num = i + 1 + this.dots.length;
                        dot.className = 'flickity-page-dot';
                        dot.textContent = `View slide ${num}`;
                        return dot;
                    });

                this.holder.append(...newDots);
                this.dots = this.dots.concat(newDots);
            };

            PageDots.prototype.removeDots = function(count) {
                // remove from this.dots collection
                let removeDots = this.dots.splice(this.dots.length - count, count);
                // remove from DOM
                removeDots.forEach((dot) => dot.remove());
            };

            PageDots.prototype.updateSelected = function(index) {
                // remove selected class on previous
                if (this.selectedDot) {
                    this.selectedDot.classList.remove('is-selected');
                    this.selectedDot.removeAttribute('aria-current');
                }
                // don't proceed if no dots
                if (!this.dots.length) return;

                this.selectedDot = this.dots[index];
                this.selectedDot.classList.add('is-selected');
                this.selectedDot.setAttribute('aria-current', 'step');
            };

            Flickity.PageDots = PageDots;

            // -------------------------- Flickity -------------------------- //

            Object.assign(Flickity.defaults, {
                pageDots: true,
            });

            Flickity.create.pageDots = function() {
                if (!this.options.pageDots) return;

                this.pageDots = new PageDots();
                this.handlePageDotsClick = this.onPageDotsClick.bind(this);
                // events
                this.on('activate', this.activatePageDots);
                this.on('select', this.updateSelectedPageDots);
                this.on('cellChange', this.updatePageDots);
                this.on('resize', this.updatePageDots);
                this.on('deactivate', this.deactivatePageDots);
            };

            let proto = Flickity.prototype;

            proto.activatePageDots = function() {
                this.pageDots.setDots(this.slides.length);
                this.focusableElems.push(...this.pageDots.dots);
                this.pageDots.holder.addEventListener('click', this.handlePageDotsClick);
                this.element.append(this.pageDots.holder);
            };

            proto.onPageDotsClick = function(event) {
                let index = this.pageDots.dots.indexOf(event.target);
                if (index === -1) return; // only dot clicks

                this.uiChange();
                this.select(index);
            };

            proto.updateSelectedPageDots = function() {
                this.pageDots.updateSelected(this.selectedIndex);
            };

            proto.updatePageDots = function() {
                this.pageDots.dots.forEach((dot) => {
                    utils.removeFrom(this.focusableElems, dot);
                });
                this.pageDots.setDots(this.slides.length);
                this.focusableElems.push(...this.pageDots.dots);
            };

            proto.deactivatePageDots = function() {
                this.pageDots.holder.remove();
                this.pageDots.holder.removeEventListener('click', this.handlePageDotsClick);
            };

            // -----  ----- //

            Flickity.PageDots = PageDots;

            return Flickity;

        }));

    }, {
        "./core": 6,
        "fizzy-ui-utils": 2
    }],
    12: [function(require, module, exports) {
        // player & autoPlay
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(require('./core'));
            } else {
                // browser global
                factory(window.Flickity);
            }

        }(typeof window != 'undefined' ? window : this, function factory(Flickity) {

            // -------------------------- Player -------------------------- //

            function Player(autoPlay, onTick) {
                this.autoPlay = autoPlay;
                this.onTick = onTick;
                this.state = 'stopped';
                // visibility change event handler
                this.onVisibilityChange = this.visibilityChange.bind(this);
                this.onVisibilityPlay = this.visibilityPlay.bind(this);
            }

            // start play
            Player.prototype.play = function() {
                if (this.state === 'playing') return;

                // do not play if page is hidden, start playing when page is visible
                let isPageHidden = document.hidden;
                if (isPageHidden) {
                    document.addEventListener('visibilitychange', this.onVisibilityPlay);
                    return;
                }

                this.state = 'playing';
                // listen to visibility change
                document.addEventListener('visibilitychange', this.onVisibilityChange);
                // start ticking
                this.tick();
            };

            Player.prototype.tick = function() {
                // do not tick if not playing
                if (this.state !== 'playing') return;

                // default to 3 seconds
                let time = typeof this.autoPlay == 'number' ? this.autoPlay : 3000;
                // HACK: reset ticks if stopped and started within interval
                this.clear();
                this.timeout = setTimeout(() => {
                    this.onTick();
                    this.tick();
                }, time);
            };

            Player.prototype.stop = function() {
                this.state = 'stopped';
                this.clear();
                // remove visibility change event
                document.removeEventListener('visibilitychange', this.onVisibilityChange);
            };

            Player.prototype.clear = function() {
                clearTimeout(this.timeout);
            };

            Player.prototype.pause = function() {
                if (this.state === 'playing') {
                    this.state = 'paused';
                    this.clear();
                }
            };

            Player.prototype.unpause = function() {
                // re-start play if paused
                if (this.state === 'paused') this.play();
            };

            // pause if page visibility is hidden, unpause if visible
            Player.prototype.visibilityChange = function() {
                let isPageHidden = document.hidden;
                this[isPageHidden ? 'pause' : 'unpause']();
            };

            Player.prototype.visibilityPlay = function() {
                this.play();
                document.removeEventListener('visibilitychange', this.onVisibilityPlay);
            };

            // -------------------------- Flickity -------------------------- //

            Object.assign(Flickity.defaults, {
                pauseAutoPlayOnHover: true,
            });

            Flickity.create.player = function() {
                this.player = new Player(this.options.autoPlay, () => {
                    this.next(true);
                });

                this.on('activate', this.activatePlayer);
                this.on('uiChange', this.stopPlayer);
                this.on('pointerDown', this.stopPlayer);
                this.on('deactivate', this.deactivatePlayer);
            };

            let proto = Flickity.prototype;

            proto.activatePlayer = function() {
                if (!this.options.autoPlay) return;

                this.player.play();
                this.element.addEventListener('mouseenter', this);
            };

            // Player API, don't hate the ... thanks I know where the door is

            proto.playPlayer = function() {
                this.player.play();
            };

            proto.stopPlayer = function() {
                this.player.stop();
            };

            proto.pausePlayer = function() {
                this.player.pause();
            };

            proto.unpausePlayer = function() {
                this.player.unpause();
            };

            proto.deactivatePlayer = function() {
                this.player.stop();
                this.element.removeEventListener('mouseenter', this);
            };

            // ----- mouseenter/leave ----- //

            // pause auto-play on hover
            proto.onmouseenter = function() {
                if (!this.options.pauseAutoPlayOnHover) return;

                this.player.pause();
                this.element.addEventListener('mouseleave', this);
            };

            // resume auto-play on hover off
            proto.onmouseleave = function() {
                this.player.unpause();
                this.element.removeEventListener('mouseleave', this);
            };

            // -----  ----- //

            Flickity.Player = Player;

            return Flickity;

        }));

    }, {
        "./core": 6
    }],
    13: [function(require, module, exports) {
        // prev/next buttons
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(require('./core'));
            } else {
                // browser global
                factory(window.Flickity);
            }

        }(typeof window != 'undefined' ? window : this, function factory(Flickity) {

            const svgURI = 'http://www.w3.org/2000/svg';

            // -------------------------- PrevNextButton -------------------------- //

            function PrevNextButton(increment, direction, arrowShape) {
                this.increment = increment;
                this.direction = direction;
                this.isPrevious = increment === 'previous';
                this.isLeft = direction === 'left';
                this._create(arrowShape);
            }

            PrevNextButton.prototype._create = function(arrowShape) {
                // properties
                let element = this.element = document.createElement('button');
                element.className = `flickity-button flickity-prev-next-button ${this.increment}`;
                let label = this.isPrevious ? 'Previous' : 'Next';
                // prevent button from submitting form https://stackoverflow.com/a/10836076/182183
                element.setAttribute('type', 'button');
                element.setAttribute('aria-label', label);
                // init as disabled
                this.disable();
                // create arrow
                let svg = this.createSVG(label, arrowShape);
                element.append(svg);
            };

            PrevNextButton.prototype.createSVG = function(label, arrowShape) {
                let svg = document.createElementNS(svgURI, 'svg');
                svg.setAttribute('class', 'flickity-button-icon');
                svg.setAttribute('viewBox', '0 0 100 100');
                // add title #1189
                let title = document.createElementNS(svgURI, 'title');
                title.append(label);
                // add path
                let path = document.createElementNS(svgURI, 'path');
                let pathMovements = getArrowMovements(arrowShape);
                path.setAttribute('d', pathMovements);
                path.setAttribute('class', 'arrow');
                // rotate arrow
                if (!this.isLeft) {
                    path.setAttribute('transform', 'translate(100, 100) rotate(180)');
                }
                svg.append(title, path);
                return svg;
            };

            // get SVG path movmement
            function getArrowMovements(shape) {
                // use shape as movement if string
                if (typeof shape == 'string') return shape;

                let {
                    x0,
                    x1,
                    x2,
                    x3,
                    y1,
                    y2
                } = shape;

                // create movement string
                return `M ${x0}, 50
    L ${x1}, ${y1 + 50}
    L ${x2}, ${y2 + 50}
    L ${x3}, 50
    L ${x2}, ${50 - y2}
    L ${x1}, ${50 - y1}
    Z`;
            }

            // -----  ----- //

            PrevNextButton.prototype.enable = function() {
                this.element.removeAttribute('disabled');
            };

            PrevNextButton.prototype.disable = function() {
                this.element.setAttribute('disabled', true);
            };

            // -------------------------- Flickity prototype -------------------------- //

            Object.assign(Flickity.defaults, {
                prevNextButtons: true,
                arrowShape: {
                    x0: 10,
                    x1: 60,
                    y1: 50,
                    x2: 70,
                    y2: 40,
                    x3: 30,
                },
            });

            Flickity.create.prevNextButtons = function() {
                if (!this.options.prevNextButtons) return;

                let {
                    rightToLeft,
                    arrowShape
                } = this.options;
                let prevDirection = rightToLeft ? 'right' : 'left';
                let nextDirection = rightToLeft ? 'left' : 'right';
                this.prevButton = new PrevNextButton('previous', prevDirection, arrowShape);
                this.nextButton = new PrevNextButton('next', nextDirection, arrowShape);
                this.focusableElems.push(this.prevButton.element);
                this.focusableElems.push(this.nextButton.element);

                this.handlePrevButtonClick = () => {
                    this.uiChange();
                    this.previous();
                };

                this.handleNextButtonClick = () => {
                    this.uiChange();
                    this.next();
                };

                this.on('activate', this.activatePrevNextButtons);
                this.on('select', this.updatePrevNextButtons);
            };

            let proto = Flickity.prototype;

            proto.updatePrevNextButtons = function() {
                let lastIndex = this.slides.length ? this.slides.length - 1 : 0;
                this.updatePrevNextButton(this.prevButton, 0);
                this.updatePrevNextButton(this.nextButton, lastIndex);
            };

            proto.updatePrevNextButton = function(button, disabledIndex) {
                // enable is wrapAround and at least 2 slides
                if (this.isWrapping && this.slides.length > 1) {
                    button.enable();
                    return;
                }

                let isEnabled = this.selectedIndex !== disabledIndex;
                button[isEnabled ? 'enable' : 'disable']();
                // if disabling button that is focused,
                // shift focus to element to maintain keyboard accessibility
                let isDisabledFocused = !isEnabled && document.activeElement === button.element;
                if (isDisabledFocused) this.focus();
            };

            proto.activatePrevNextButtons = function() {
                this.prevButton.element.addEventListener('click', this.handlePrevButtonClick);
                this.nextButton.element.addEventListener('click', this.handleNextButtonClick);
                this.element.append(this.prevButton.element, this.nextButton.element);
                this.on('deactivate', this.deactivatePrevNextButtons);
            };

            proto.deactivatePrevNextButtons = function() {
                this.prevButton.element.remove();
                this.nextButton.element.remove();
                this.prevButton.element.removeEventListener('click', this.handlePrevButtonClick);
                this.nextButton.element.removeEventListener('click', this.handleNextButtonClick);
                this.off('deactivate', this.deactivatePrevNextButtons);
            };

            // --------------------------  -------------------------- //

            Flickity.PrevNextButton = PrevNextButton;

            return Flickity;

        }));

    }, {
        "./core": 6
    }],
    14: [function(require, module, exports) {
        // slide
        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory();
            } else {
                // browser global
                window.Flickity = window.Flickity || {};
                window.Flickity.Slide = factory();
            }

        }(typeof window != 'undefined' ? window : this, function factory() {

            function Slide(beginMargin, endMargin, cellAlign) {
                this.beginMargin = beginMargin;
                this.endMargin = endMargin;
                this.cellAlign = cellAlign;
                this.cells = [];
                this.outerWidth = 0;
                this.height = 0;
            }

            let proto = Slide.prototype;

            proto.addCell = function(cell) {
                this.cells.push(cell);
                this.outerWidth += cell.size.outerWidth;
                this.height = Math.max(cell.size.outerHeight, this.height);
                // first cell stuff
                if (this.cells.length === 1) {
                    this.x = cell.x; // x comes from first cell
                    this.firstMargin = cell.size[this.beginMargin];
                }
            };

            proto.updateTarget = function() {
                let lastCell = this.getLastCell();
                let lastMargin = lastCell ? lastCell.size[this.endMargin] : 0;
                let slideWidth = this.outerWidth - (this.firstMargin + lastMargin);
                this.target = this.x + this.firstMargin + slideWidth * this.cellAlign;
            };

            proto.getLastCell = function() {
                return this.cells[this.cells.length - 1];
            };

            proto.select = function() {
                this.cells.forEach((cell) => cell.select());
            };

            proto.unselect = function() {
                this.cells.forEach((cell) => cell.unselect());
            };

            proto.getCellElements = function() {
                return this.cells.map((cell) => cell.element);
            };

            return Slide;

        }));

    }, {}],
    15: [function(require, module, exports) {
        /*!
         * Infinite Scroll v2.0.4
         * measure size of elements
         * MIT license
         */

        (function(window, factory) {
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory();
            } else {
                // browser global
                window.getSize = factory();
            }

        })(window, function factory() {

            // -------------------------- helpers -------------------------- //

            // get a number from a string, not a percentage
            function getStyleSize(value) {
                let num = parseFloat(value);
                // not a percent like '100%', and a number
                let isValid = value.indexOf('%') == -1 && !isNaN(num);
                return isValid && num;
            }

            // -------------------------- measurements -------------------------- //

            let measurements = [
                'paddingLeft',
                'paddingRight',
                'paddingTop',
                'paddingBottom',
                'marginLeft',
                'marginRight',
                'marginTop',
                'marginBottom',
                'borderLeftWidth',
                'borderRightWidth',
                'borderTopWidth',
                'borderBottomWidth',
            ];

            let measurementsLength = measurements.length;

            function getZeroSize() {
                let size = {
                    width: 0,
                    height: 0,
                    innerWidth: 0,
                    innerHeight: 0,
                    outerWidth: 0,
                    outerHeight: 0,
                };
                measurements.forEach((measurement) => {
                    size[measurement] = 0;
                });
                return size;
            }

            // -------------------------- getSize -------------------------- //

            function getSize(elem) {
                // use querySeletor if elem is string
                if (typeof elem == 'string') elem = document.querySelector(elem);

                // do not proceed on non-objects
                let isElement = elem && typeof elem == 'object' && elem.nodeType;
                if (!isElement) return;

                let style = getComputedStyle(elem);

                // if hidden, everything is 0
                if (style.display == 'none') return getZeroSize();

                let size = {};
                size.width = elem.offsetWidth;
                size.height = elem.offsetHeight;

                let isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

                // get all measurements
                measurements.forEach((measurement) => {
                    let value = style[measurement];
                    let num = parseFloat(value);
                    // any 'auto', 'medium' value will be 0
                    size[measurement] = !isNaN(num) ? num : 0;
                });

                let paddingWidth = size.paddingLeft + size.paddingRight;
                let paddingHeight = size.paddingTop + size.paddingBottom;
                let marginWidth = size.marginLeft + size.marginRight;
                let marginHeight = size.marginTop + size.marginBottom;
                let borderWidth = size.borderLeftWidth + size.borderRightWidth;
                let borderHeight = size.borderTopWidth + size.borderBottomWidth;

                // overwrite width and height if we can get it from style
                let styleWidth = getStyleSize(style.width);
                if (styleWidth !== false) {
                    size.width = styleWidth +
                        // add padding and border unless it's already including it
                        (isBorderBox ? 0 : paddingWidth + borderWidth);
                }

                let styleHeight = getStyleSize(style.height);
                if (styleHeight !== false) {
                    size.height = styleHeight +
                        // add padding and border unless it's already including it
                        (isBorderBox ? 0 : paddingHeight + borderHeight);
                }

                size.innerWidth = size.width - (paddingWidth + borderWidth);
                size.innerHeight = size.height - (paddingHeight + borderHeight);

                size.outerWidth = size.width + marginWidth;
                size.outerHeight = size.height + marginHeight;

                return size;
            }

            return getSize;

        });

    }, {}],
    16: [function(require, module, exports) {
        /*!
         * imagesLoaded v5.0.0
         * JavaScript is all like "You images are done yet or what?"
         * MIT License
         */

        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(window, require('ev-emitter'));
            } else {
                // browser global
                window.imagesLoaded = factory(window, window.EvEmitter);
            }

        })(typeof window !== 'undefined' ? window : this,
            function factory(window, EvEmitter) {

                let $ = window.jQuery;
                let console = window.console;

                // -------------------------- helpers -------------------------- //

                // turn element or nodeList into an array
                function makeArray(obj) {
                    // use object if already an array
                    if (Array.isArray(obj)) return obj;

                    let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
                    // convert nodeList to array
                    if (isArrayLike) return [...obj];

                    // array of single index
                    return [obj];
                }

                // -------------------------- imagesLoaded -------------------------- //

                /**
                 * @param {[Array, Element, NodeList, String]} elem
                 * @param {[Object, Function]} options - if function, use as callback
                 * @param {Function} onAlways - callback function
                 * @returns {ImagesLoaded}
                 */
                function ImagesLoaded(elem, options, onAlways) {
                    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
                    if (!(this instanceof ImagesLoaded)) {
                        return new ImagesLoaded(elem, options, onAlways);
                    }
                    // use elem as selector string
                    let queryElem = elem;
                    if (typeof elem == 'string') {
                        queryElem = document.querySelectorAll(elem);
                    }
                    // bail if bad element
                    if (!queryElem) {
                        console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
                        return;
                    }

                    this.elements = makeArray(queryElem);
                    this.options = {};
                    // shift arguments if no options set
                    if (typeof options == 'function') {
                        onAlways = options;
                    } else {
                        Object.assign(this.options, options);
                    }

                    if (onAlways) this.on('always', onAlways);

                    this.getImages();
                    // add jQuery Deferred object
                    if ($) this.jqDeferred = new $.Deferred();

                    // HACK check async to allow time to bind listeners
                    setTimeout(this.check.bind(this));
                }

                ImagesLoaded.prototype = Object.create(EvEmitter.prototype);

                ImagesLoaded.prototype.getImages = function() {
                    this.images = [];

                    // filter & find items if we have an item selector
                    this.elements.forEach(this.addElementImages, this);
                };

                const elementNodeTypes = [1, 9, 11];

                /**
                 * @param {Node} elem
                 */
                ImagesLoaded.prototype.addElementImages = function(elem) {
                    // filter siblings
                    if (elem.nodeName === 'IMG') {
                        this.addImage(elem);
                    }
                    // get background image on element
                    if (this.options.background === true) {
                        this.addElementBackgroundImages(elem);
                    }

                    // find children
                    // no non-element nodes, #143
                    let {
                        nodeType
                    } = elem;
                    if (!nodeType || !elementNodeTypes.includes(nodeType)) return;

                    let childImgs = elem.querySelectorAll('img');
                    // concat childElems to filterFound array
                    for (let img of childImgs) {
                        this.addImage(img);
                    }

                    // get child background images
                    if (typeof this.options.background == 'string') {
                        let children = elem.querySelectorAll(this.options.background);
                        for (let child of children) {
                            this.addElementBackgroundImages(child);
                        }
                    }
                };

                const reURL = /url\((['"])?(.*?)\1\)/gi;

                ImagesLoaded.prototype.addElementBackgroundImages = function(elem) {
                    let style = getComputedStyle(elem);
                    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
                    if (!style) return;

                    // get url inside url("...")
                    let matches = reURL.exec(style.backgroundImage);
                    while (matches !== null) {
                        let url = matches && matches[2];
                        if (url) {
                            this.addBackground(url, elem);
                        }
                        matches = reURL.exec(style.backgroundImage);
                    }
                };

                /**
                 * @param {Image} img
                 */
                ImagesLoaded.prototype.addImage = function(img) {
                    let loadingImage = new LoadingImage(img);
                    this.images.push(loadingImage);
                };

                ImagesLoaded.prototype.addBackground = function(url, elem) {
                    let background = new Background(url, elem);
                    this.images.push(background);
                };

                ImagesLoaded.prototype.check = function() {
                    this.progressedCount = 0;
                    this.hasAnyBroken = false;
                    // complete if no images
                    if (!this.images.length) {
                        this.complete();
                        return;
                    }

                    /* eslint-disable-next-line func-style */
                    let onProgress = (image, elem, message) => {
                        // HACK - Chrome triggers event before object properties have changed. #83
                        setTimeout(() => {
                            this.progress(image, elem, message);
                        });
                    };

                    this.images.forEach(function(loadingImage) {
                        loadingImage.once('progress', onProgress);
                        loadingImage.check();
                    });
                };

                ImagesLoaded.prototype.progress = function(image, elem, message) {
                    this.progressedCount++;
                    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
                    // progress event
                    this.emitEvent('progress', [this, image, elem]);
                    if (this.jqDeferred && this.jqDeferred.notify) {
                        this.jqDeferred.notify(this, image);
                    }
                    // check if completed
                    if (this.progressedCount === this.images.length) {
                        this.complete();
                    }

                    if (this.options.debug && console) {
                        console.log(`progress: ${message}`, image, elem);
                    }
                };

                ImagesLoaded.prototype.complete = function() {
                    let eventName = this.hasAnyBroken ? 'fail' : 'done';
                    this.isComplete = true;
                    this.emitEvent(eventName, [this]);
                    this.emitEvent('always', [this]);
                    if (this.jqDeferred) {
                        let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
                        this.jqDeferred[jqMethod](this);
                    }
                };

                // --------------------------  -------------------------- //

                function LoadingImage(img) {
                    this.img = img;
                }

                LoadingImage.prototype = Object.create(EvEmitter.prototype);

                LoadingImage.prototype.check = function() {
                    // If complete is true and browser supports natural sizes,
                    // try to check for image status manually.
                    let isComplete = this.getIsImageComplete();
                    if (isComplete) {
                        // report based on naturalWidth
                        this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                        return;
                    }

                    // If none of the checks above matched, simulate loading on detached element.
                    this.proxyImage = new Image();
                    // add crossOrigin attribute. #204
                    if (this.img.crossOrigin) {
                        this.proxyImage.crossOrigin = this.img.crossOrigin;
                    }
                    this.proxyImage.addEventListener('load', this);
                    this.proxyImage.addEventListener('error', this);
                    // bind to image as well for Firefox. #191
                    this.img.addEventListener('load', this);
                    this.img.addEventListener('error', this);
                    this.proxyImage.src = this.img.currentSrc || this.img.src;
                };

                LoadingImage.prototype.getIsImageComplete = function() {
                    // check for non-zero, non-undefined naturalWidth
                    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
                    return this.img.complete && this.img.naturalWidth;
                };

                LoadingImage.prototype.confirm = function(isLoaded, message) {
                    this.isLoaded = isLoaded;
                    let {
                        parentNode
                    } = this.img;
                    // emit progress with parent <picture> or self <img>
                    let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
                    this.emitEvent('progress', [this, elem, message]);
                };

                // ----- events ----- //

                // trigger specified handler for event type
                LoadingImage.prototype.handleEvent = function(event) {
                    let method = 'on' + event.type;
                    if (this[method]) {
                        this[method](event);
                    }
                };

                LoadingImage.prototype.onload = function() {
                    this.confirm(true, 'onload');
                    this.unbindEvents();
                };

                LoadingImage.prototype.onerror = function() {
                    this.confirm(false, 'onerror');
                    this.unbindEvents();
                };

                LoadingImage.prototype.unbindEvents = function() {
                    this.proxyImage.removeEventListener('load', this);
                    this.proxyImage.removeEventListener('error', this);
                    this.img.removeEventListener('load', this);
                    this.img.removeEventListener('error', this);
                };

                // -------------------------- Background -------------------------- //

                function Background(url, element) {
                    this.url = url;
                    this.element = element;
                    this.img = new Image();
                }

                // inherit LoadingImage prototype
                Background.prototype = Object.create(LoadingImage.prototype);

                Background.prototype.check = function() {
                    this.img.addEventListener('load', this);
                    this.img.addEventListener('error', this);
                    this.img.src = this.url;
                    // check if image is already complete
                    let isComplete = this.getIsImageComplete();
                    if (isComplete) {
                        this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
                        this.unbindEvents();
                    }
                };

                Background.prototype.unbindEvents = function() {
                    this.img.removeEventListener('load', this);
                    this.img.removeEventListener('error', this);
                };

                Background.prototype.confirm = function(isLoaded, message) {
                    this.isLoaded = isLoaded;
                    this.emitEvent('progress', [this, this.element, message]);
                };

                // -------------------------- jQuery -------------------------- //

                ImagesLoaded.makeJQueryPlugin = function(jQuery) {
                    jQuery = jQuery || window.jQuery;
                    if (!jQuery) return;

                    // set local variable
                    $ = jQuery;
                    // $().imagesLoaded()
                    $.fn.imagesLoaded = function(options, onAlways) {
                        let instance = new ImagesLoaded(this, options, onAlways);
                        return instance.jqDeferred.promise($(this));
                    };
                };
                // try making plugin
                ImagesLoaded.makeJQueryPlugin();

                // --------------------------  -------------------------- //

                return ImagesLoaded;

            });

    }, {
        "ev-emitter": 1
    }],
    17: [function(require, module, exports) {
        /*!
         * Unidragger v3.0.1
         * Draggable base class
         * MIT license
         */

        (function(window, factory) {
            // universal module definition
            if (typeof module == 'object' && module.exports) {
                // CommonJS
                module.exports = factory(
                    window,
                    require('ev-emitter'),
                );
            } else {
                // browser global
                window.Unidragger = factory(
                    window,
                    window.EvEmitter,
                );
            }

        }(typeof window != 'undefined' ? window : this, function factory(window, EvEmitter) {

            function Unidragger() {}

            // inherit EvEmitter
            let proto = Unidragger.prototype = Object.create(EvEmitter.prototype);

            // ----- bind start ----- //

            // trigger handler methods for events
            proto.handleEvent = function(event) {
                let method = 'on' + event.type;
                if (this[method]) {
                    this[method](event);
                }
            };

            let startEvent, activeEvents;
            if ('ontouchstart' in window) {
                // HACK prefer Touch Events as you can preventDefault on touchstart to
                // disable scroll in iOS & mobile Chrome metafizzy/flickity#1177
                startEvent = 'touchstart';
                activeEvents = ['touchmove', 'touchend', 'touchcancel'];
            } else if (window.PointerEvent) {
                // Pointer Events
                startEvent = 'pointerdown';
                activeEvents = ['pointermove', 'pointerup', 'pointercancel'];
            } else {
                // mouse events
                startEvent = 'mousedown';
                activeEvents = ['mousemove', 'mouseup'];
            }

            // prototype so it can be overwriteable by Flickity
            proto.touchActionValue = 'none';

            proto.bindHandles = function() {
                this._bindHandles('addEventListener', this.touchActionValue);
            };

            proto.unbindHandles = function() {
                this._bindHandles('removeEventListener', '');
            };

            /**
             * Add or remove start event
             * @param {String} bindMethod - addEventListener or removeEventListener
             * @param {String} touchAction - value for touch-action CSS property
             */
            proto._bindHandles = function(bindMethod, touchAction) {
                this.handles.forEach((handle) => {
                    handle[bindMethod](startEvent, this);
                    handle[bindMethod]('click', this);
                    // touch-action: none to override browser touch gestures. metafizzy/flickity#540
                    if (window.PointerEvent) handle.style.touchAction = touchAction;
                });
            };

            proto.bindActivePointerEvents = function() {
                activeEvents.forEach((eventName) => {
                    window.addEventListener(eventName, this);
                });
            };

            proto.unbindActivePointerEvents = function() {
                activeEvents.forEach((eventName) => {
                    window.removeEventListener(eventName, this);
                });
            };

            // ----- event handler helpers ----- //

            // trigger method with matching pointer
            proto.withPointer = function(methodName, event) {
                if (event.pointerId === this.pointerIdentifier) {
                    this[methodName](event, event);
                }
            };

            // trigger method with matching touch
            proto.withTouch = function(methodName, event) {
                let touch;
                for (let changedTouch of event.changedTouches) {
                    if (changedTouch.identifier === this.pointerIdentifier) {
                        touch = changedTouch;
                    }
                }
                if (touch) this[methodName](event, touch);
            };

            // ----- start event ----- //

            proto.onmousedown = function(event) {
                this.pointerDown(event, event);
            };

            proto.ontouchstart = function(event) {
                this.pointerDown(event, event.changedTouches[0]);
            };

            proto.onpointerdown = function(event) {
                this.pointerDown(event, event);
            };

            // nodes that have text fields
            const cursorNodes = ['TEXTAREA', 'INPUT', 'SELECT', 'OPTION'];
            // input types that do not have text fields
            const clickTypes = ['radio', 'checkbox', 'button', 'submit', 'image', 'file'];

            /**
             * any time you set `event, pointer` it refers to:
             * @param {Event} event
             * @param {Event | Touch} pointer
             */
            proto.pointerDown = function(event, pointer) {
                // dismiss multi-touch taps, right clicks, and clicks on text fields
                let isCursorNode = cursorNodes.includes(event.target.nodeName);
                let isClickType = clickTypes.includes(event.target.type);
                let isOkayElement = !isCursorNode || isClickType;
                let isOkay = !this.isPointerDown && !event.button && isOkayElement;
                if (!isOkay) return;

                this.isPointerDown = true;
                // save pointer identifier to match up touch events
                this.pointerIdentifier = pointer.pointerId !== undefined ?
                    // pointerId for pointer events, touch.indentifier for touch events
                    pointer.pointerId : pointer.identifier;
                // track position for move
                this.pointerDownPointer = {
                    pageX: pointer.pageX,
                    pageY: pointer.pageY,
                };

                this.bindActivePointerEvents();
                this.emitEvent('pointerDown', [event, pointer]);
            };

            // ----- move ----- //

            proto.onmousemove = function(event) {
                this.pointerMove(event, event);
            };

            proto.onpointermove = function(event) {
                this.withPointer('pointerMove', event);
            };

            proto.ontouchmove = function(event) {
                this.withTouch('pointerMove', event);
            };

            proto.pointerMove = function(event, pointer) {
                let moveVector = {
                    x: pointer.pageX - this.pointerDownPointer.pageX,
                    y: pointer.pageY - this.pointerDownPointer.pageY,
                };
                this.emitEvent('pointerMove', [event, pointer, moveVector]);
                // start drag if pointer has moved far enough to start drag
                let isDragStarting = !this.isDragging && this.hasDragStarted(moveVector);
                if (isDragStarting) this.dragStart(event, pointer);
                if (this.isDragging) this.dragMove(event, pointer, moveVector);
            };

            // condition if pointer has moved far enough to start drag
            proto.hasDragStarted = function(moveVector) {
                return Math.abs(moveVector.x) > 3 || Math.abs(moveVector.y) > 3;
            };

            // ----- drag ----- //

            proto.dragStart = function(event, pointer) {
                this.isDragging = true;
                this.isPreventingClicks = true; // set flag to prevent clicks
                this.emitEvent('dragStart', [event, pointer]);
            };

            proto.dragMove = function(event, pointer, moveVector) {
                this.emitEvent('dragMove', [event, pointer, moveVector]);
            };

            // ----- end ----- //

            proto.onmouseup = function(event) {
                this.pointerUp(event, event);
            };

            proto.onpointerup = function(event) {
                this.withPointer('pointerUp', event);
            };

            proto.ontouchend = function(event) {
                this.withTouch('pointerUp', event);
            };

            proto.pointerUp = function(event, pointer) {
                this.pointerDone();
                this.emitEvent('pointerUp', [event, pointer]);

                if (this.isDragging) {
                    this.dragEnd(event, pointer);
                } else {
                    // pointer didn't move enough for drag to start
                    this.staticClick(event, pointer);
                }
            };

            proto.dragEnd = function(event, pointer) {
                this.isDragging = false; // reset flag
                // re-enable clicking async
                setTimeout(() => delete this.isPreventingClicks);

                this.emitEvent('dragEnd', [event, pointer]);
            };

            // triggered on pointer up & pointer cancel
            proto.pointerDone = function() {
                this.isPointerDown = false;
                delete this.pointerIdentifier;
                this.unbindActivePointerEvents();
                this.emitEvent('pointerDone');
            };

            // ----- cancel ----- //

            proto.onpointercancel = function(event) {
                this.withPointer('pointerCancel', event);
            };

            proto.ontouchcancel = function(event) {
                this.withTouch('pointerCancel', event);
            };

            proto.pointerCancel = function(event, pointer) {
                this.pointerDone();
                this.emitEvent('pointerCancel', [event, pointer]);
            };

            // ----- click ----- //

            // handle all clicks and prevent clicks when dragging
            proto.onclick = function(event) {
                if (this.isPreventingClicks) event.preventDefault();
            };

            // triggered after pointer down & up with no/tiny movement
            proto.staticClick = function(event, pointer) {
                // ignore emulated mouse up clicks
                let isMouseup = event.type === 'mouseup';
                if (isMouseup && this.isIgnoringMouseUp) return;

                this.emitEvent('staticClick', [event, pointer]);

                // set flag for emulated clicks 300ms after touchend
                if (isMouseup) {
                    this.isIgnoringMouseUp = true;
                    // reset flag after 400ms
                    setTimeout(() => {
                        delete this.isIgnoringMouseUp;
                    }, 400);
                }
            };

            // -----  ----- //

            return Unidragger;

        }));

    }, {
        "ev-emitter": 1
    }],
    18: [function(require, module, exports) {
        "use strict";

        var icon = document.getElementById("icon");

        icon.onclick = function() {
            document.body.classList.toggle("dark-theme");

            if (document.body.classList.contains("dark-theme")) {
                icon.src = "https://pluspng.com/img-png/black-sun-png-sun-icons-512.png";
            } else {
                icon.src = "https://www.pinclipart.com/picdir/big/82-820235_white-crescent-moon-clipart-png-download.png";
            }
        };

    }, {}],
    19: [function(require, module, exports) {
        "use strict";

        var hamburger = document.getElementById('hamburger');
        hamburger.addEventListener('click', function(e) {
            var ul = document.querySelector('nav > ul');
            ul.classList.toggle('menu-slide');
            hamburger.classList.toggle('cross');
        });

    }, {}],
    20: [function(require, module, exports) {
        "use strict";

        var _flickity = _interopRequireDefault(require("flickity"));

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : {
                "default": obj
            };
        }

        var elem = document.querySelector('.main-carousel');

        if (elem) {
            var flkty = new _flickity["default"](elem, {
                // options
                cellAlign: 'left',
                contain: true,
                wrapAround: true,
                autoPlay: 2500
            });
        }

    }, {
        "flickity": 9
    }],
    21: [function(require, module, exports) {
        "use strict";

        window.addEventListener('DOMContentLoaded', function() {
            require("./modules/_navbar.js");

            require("./modules/_slider.js");

            require("./modules/_darktheme.js");
        });

    }, {
        "./modules/_darktheme.js": 18,
        "./modules/_navbar.js": 19,
        "./modules/_slider.js": 20
    }]
}, {}, [21])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZXYtZW1pdHRlci9ldi1lbWl0dGVyLmpzIiwibm9kZV9tb2R1bGVzL2Zpenp5LXVpLXV0aWxzL3V0aWxzLmpzIiwibm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2FkZC1yZW1vdmUtY2VsbC5qcyIsIm5vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9hbmltYXRlLmpzIiwibm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2NlbGwuanMiLCJub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9kcmFnLmpzIiwibm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2ltYWdlc2xvYWRlZC5qcyIsIm5vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9sYXp5bG9hZC5qcyIsIm5vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wYWdlLWRvdHMuanMiLCJub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvcGxheWVyLmpzIiwibm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL3ByZXYtbmV4dC1idXR0b24uanMiLCJub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvc2xpZGUuanMiLCJub2RlX21vZHVsZXMvZ2V0LXNpemUvZ2V0LXNpemUuanMiLCJub2RlX21vZHVsZXMvaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZC5qcyIsIm5vZGVfbW9kdWxlcy91bmlkcmFnZ2VyL3VuaWRyYWdnZXIuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2Zyb250L2pzL21vZHVsZXMvX2Rhcmt0aGVtZS5qcyIsInJlc291cmNlcy9hc3NldHMvZnJvbnQvanMvbW9kdWxlcy9fbmF2YmFyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9mcm9udC9qcy9tb2R1bGVzL19zbGlkZXIuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2Zyb250L2pzL3NjcmlwdHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2M0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2pTQSxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixNQUF4QixDQUFiOztBQUNBLElBQUksQ0FBQyxPQUFMLEdBQWUsWUFBWTtFQUN2QixRQUFRLENBQUMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsWUFBL0I7O0VBQ0EsSUFBSSxRQUFRLENBQUMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsUUFBeEIsQ0FBaUMsWUFBakMsQ0FBSixFQUFvRDtJQUNoRCxJQUFJLENBQUMsR0FBTCxHQUFXLDZEQUFYO0VBQ0gsQ0FGRCxNQUVPO0lBQ0gsSUFBSSxDQUFDLEdBQUwsR0FBVyw4RkFBWDtFQUNIO0FBQ0osQ0FQRDs7Ozs7QUNEQSxJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBVCxDQUF3QixXQUF4QixDQUFsQjtBQUNBLFNBQVMsQ0FBQyxnQkFBVixDQUEyQixPQUEzQixFQUFvQyxVQUFVLENBQVYsRUFBYTtFQUM3QyxJQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixVQUF2QixDQUFYO0VBQ0EsRUFBRSxDQUFDLFNBQUgsQ0FBYSxNQUFiLENBQW9CLFlBQXBCO0VBQ0EsU0FBUyxDQUFDLFNBQVYsQ0FBb0IsTUFBcEIsQ0FBMkIsT0FBM0I7QUFDSCxDQUpEOzs7OztBQ0RBOzs7O0FBRUEsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQVg7O0FBQ0EsSUFBSSxJQUFKLEVBQVU7RUFDTixJQUFJLEtBQUssR0FBRyxJQUFJLG9CQUFKLENBQWEsSUFBYixFQUFtQjtJQUMzQjtJQUNBLFNBQVMsRUFBRSxNQUZnQjtJQUczQixPQUFPLEVBQUUsSUFIa0I7SUFJM0IsVUFBVSxFQUFFLElBSmU7SUFLM0IsUUFBUSxFQUFFO0VBTGlCLENBQW5CLENBQVo7QUFPSDs7Ozs7QUNYRCxNQUFNLENBQUMsZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLFlBQU07RUFDOUMsT0FBTyxDQUFDLHNCQUFELENBQVA7O0VBQ0EsT0FBTyxDQUFDLHNCQUFELENBQVA7O0VBQ0EsT0FBTyxDQUFDLHlCQUFELENBQVA7QUFDSCxDQUpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBFdkVtaXR0ZXIgdjIuMS4xXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG5sZXQgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkgcmV0dXJuIHRoaXM7XG5cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIGxldCBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgbGV0IGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggIWxpc3RlbmVycy5pbmNsdWRlcyggbGlzdGVuZXIgKSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkgcmV0dXJuIHRoaXM7XG5cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIGxldCBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICBsZXQgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGxldCBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkgcmV0dXJuIHRoaXM7XG5cbiAgbGV0IGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgbGV0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSByZXR1cm4gdGhpcztcblxuICAvLyBjb3B5IG92ZXIgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIGlmIC5vZmYoKSBpbiBsaXN0ZW5lclxuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoIDAgKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgbGV0IG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMgKSB7XG4gICAgbGV0IGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59ICkgKTtcbiIsIi8qKlxuICogRml6enkgVUkgdXRpbHMgdjMuMC4wXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSggZ2xvYmFsICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBnbG9iYWwuZml6enlVSVV0aWxzID0gZmFjdG9yeSggZ2xvYmFsICk7XG4gIH1cblxufSggdGhpcywgZnVuY3Rpb24gZmFjdG9yeSggZ2xvYmFsICkge1xuXG5sZXQgdXRpbHMgPSB7fTtcblxuLy8gLS0tLS0gZXh0ZW5kIC0tLS0tIC8vXG5cbi8vIGV4dGVuZHMgb2JqZWN0c1xudXRpbHMuZXh0ZW5kID0gZnVuY3Rpb24oIGEsIGIgKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKCBhLCBiICk7XG59O1xuXG4vLyAtLS0tLSBtb2R1bG8gLS0tLS0gLy9cblxudXRpbHMubW9kdWxvID0gZnVuY3Rpb24oIG51bSwgZGl2ICkge1xuICByZXR1cm4gKCAoIG51bSAlIGRpdiApICsgZGl2ICkgJSBkaXY7XG59O1xuXG4vLyAtLS0tLSBtYWtlQXJyYXkgLS0tLS0gLy9cblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbnV0aWxzLm1ha2VBcnJheSA9IGZ1bmN0aW9uKCBvYmogKSB7XG4gIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkgcmV0dXJuIG9iajtcblxuICAvLyByZXR1cm4gZW1wdHkgYXJyYXkgaWYgdW5kZWZpbmVkIG9yIG51bGwuICM2XG4gIGlmICggb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIFtdO1xuXG4gIGxldCBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgaWYgKCBpc0FycmF5TGlrZSApIHJldHVybiBbIC4uLm9iaiBdO1xuXG4gIC8vIGFycmF5IG9mIHNpbmdsZSBpbmRleFxuICByZXR1cm4gWyBvYmogXTtcbn07XG5cbi8vIC0tLS0tIHJlbW92ZUZyb20gLS0tLS0gLy9cblxudXRpbHMucmVtb3ZlRnJvbSA9IGZ1bmN0aW9uKCBhcnksIG9iaiApIHtcbiAgbGV0IGluZGV4ID0gYXJ5LmluZGV4T2YoIG9iaiApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGFyeS5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFBhcmVudCAtLS0tLSAvL1xuXG51dGlscy5nZXRQYXJlbnQgPSBmdW5jdGlvbiggZWxlbSwgc2VsZWN0b3IgKSB7XG4gIHdoaWxlICggZWxlbS5wYXJlbnROb2RlICYmIGVsZW0gIT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIGlmICggZWxlbS5tYXRjaGVzKCBzZWxlY3RvciApICkgcmV0dXJuIGVsZW07XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFF1ZXJ5RWxlbWVudCAtLS0tLSAvL1xuXG4vLyB1c2UgZWxlbWVudCBhcyBzZWxlY3RvciBzdHJpbmdcbnV0aWxzLmdldFF1ZXJ5RWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cbiAgcmV0dXJuIGVsZW07XG59O1xuXG4vLyAtLS0tLSBoYW5kbGVFdmVudCAtLS0tLSAvL1xuXG4vLyBlbmFibGUgLm9udHlwZSB0byB0cmlnZ2VyIGZyb20gLmFkZEV2ZW50TGlzdGVuZXIoIGVsZW0sICd0eXBlJyApXG51dGlscy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgbGV0IG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBmaWx0ZXJGaW5kRWxlbWVudHMgLS0tLS0gLy9cblxudXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zLCBzZWxlY3RvciApIHtcbiAgLy8gbWFrZSBhcnJheSBvZiBlbGVtc1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcblxuICByZXR1cm4gZWxlbXNcbiAgICAvLyBjaGVjayB0aGF0IGVsZW0gaXMgYW4gYWN0dWFsIGVsZW1lbnRcbiAgICAuZmlsdGVyKCAoIGVsZW0gKSA9PiBlbGVtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgKVxuICAgIC5yZWR1Y2UoICggZmZFbGVtcywgZWxlbSApID0+IHtcbiAgICAgIC8vIGFkZCBlbGVtIGlmIG5vIHNlbGVjdG9yXG4gICAgICBpZiAoICFzZWxlY3RvciApIHtcbiAgICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICAgIHJldHVybiBmZkVsZW1zO1xuICAgICAgfVxuICAgICAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGEgc2VsZWN0b3JcbiAgICAgIC8vIGZpbHRlclxuICAgICAgaWYgKCBlbGVtLm1hdGNoZXMoIHNlbGVjdG9yICkgKSB7XG4gICAgICAgIGZmRWxlbXMucHVzaCggZWxlbSApO1xuICAgICAgfVxuICAgICAgLy8gZmluZCBjaGlsZHJlblxuICAgICAgbGV0IGNoaWxkRWxlbXMgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gICAgICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICAgICAgZmZFbGVtcyA9IGZmRWxlbXMuY29uY2F0KCAuLi5jaGlsZEVsZW1zICk7XG4gICAgICByZXR1cm4gZmZFbGVtcztcbiAgICB9LCBbXSApO1xufTtcblxuLy8gLS0tLS0gZGVib3VuY2VNZXRob2QgLS0tLS0gLy9cblxudXRpbHMuZGVib3VuY2VNZXRob2QgPSBmdW5jdGlvbiggX2NsYXNzLCBtZXRob2ROYW1lLCB0aHJlc2hvbGQgKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAxMDA7XG4gIC8vIG9yaWdpbmFsIG1ldGhvZFxuICBsZXQgbWV0aG9kID0gX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdO1xuICBsZXQgdGltZW91dE5hbWUgPSBtZXRob2ROYW1lICsgJ1RpbWVvdXQnO1xuXG4gIF9jbGFzcy5wcm90b3R5cGVbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCggdGhpc1sgdGltZW91dE5hbWUgXSApO1xuXG4gICAgbGV0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdGhpc1sgdGltZW91dE5hbWUgXSA9IHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgIG1ldGhvZC5hcHBseSggdGhpcywgYXJncyApO1xuICAgICAgZGVsZXRlIHRoaXNbIHRpbWVvdXROYW1lIF07XG4gICAgfSwgdGhyZXNob2xkICk7XG4gIH07XG59O1xuXG4vLyAtLS0tLSBkb2NSZWFkeSAtLS0tLSAvL1xuXG51dGlscy5kb2NSZWFkeSA9IGZ1bmN0aW9uKCBvbkRvY1JlYWR5ICkge1xuICBsZXQgcmVhZHlTdGF0ZSA9IGRvY3VtZW50LnJlYWR5U3RhdGU7XG4gIGlmICggcmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnIHx8IHJlYWR5U3RhdGUgPT0gJ2ludGVyYWN0aXZlJyApIHtcbiAgICAvLyBkbyBhc3luYyB0byBhbGxvdyBmb3Igb3RoZXIgc2NyaXB0cyB0byBydW4uIG1ldGFmaXp6eS9mbGlja2l0eSM0NDFcbiAgICBzZXRUaW1lb3V0KCBvbkRvY1JlYWR5ICk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBvbkRvY1JlYWR5ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGh0bWxJbml0IC0tLS0tIC8vXG5cbi8vIGh0dHA6Ly9iaXQubHkvM29ZTHVzY1xudXRpbHMudG9EYXNoZWQgPSBmdW5jdGlvbiggc3RyICkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoIC8oLikoW0EtWl0pL2csIGZ1bmN0aW9uKCBtYXRjaCwgJDEsICQyICkge1xuICAgIHJldHVybiAkMSArICctJyArICQyO1xuICB9ICkudG9Mb3dlckNhc2UoKTtcbn07XG5cbmxldCBjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGU7XG5cbi8vIGFsbG93IHVzZXIgdG8gaW5pdGlhbGl6ZSBjbGFzc2VzIHZpYSBbZGF0YS1uYW1lc3BhY2VdIG9yIC5qcy1uYW1lc3BhY2UgY2xhc3Ncbi8vIGh0bWxJbml0KCBXaWRnZXQsICd3aWRnZXROYW1lJyApXG4vLyBvcHRpb25zIGFyZSBwYXJzZWQgZnJvbSBkYXRhLW5hbWVzcGFjZS1vcHRpb25zXG51dGlscy5odG1sSW5pdCA9IGZ1bmN0aW9uKCBXaWRnZXRDbGFzcywgbmFtZXNwYWNlICkge1xuICB1dGlscy5kb2NSZWFkeSggZnVuY3Rpb24oKSB7XG4gICAgbGV0IGRhc2hlZE5hbWVzcGFjZSA9IHV0aWxzLnRvRGFzaGVkKCBuYW1lc3BhY2UgKTtcbiAgICBsZXQgZGF0YUF0dHIgPSAnZGF0YS0nICsgZGFzaGVkTmFtZXNwYWNlO1xuICAgIGxldCBkYXRhQXR0ckVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggYFske2RhdGFBdHRyfV1gICk7XG4gICAgbGV0IGpRdWVyeSA9IGdsb2JhbC5qUXVlcnk7XG5cbiAgICBbIC4uLmRhdGFBdHRyRWxlbXMgXS5mb3JFYWNoKCAoIGVsZW0gKSA9PiB7XG4gICAgICBsZXQgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhQXR0ciApO1xuICAgICAgbGV0IG9wdGlvbnM7XG4gICAgICB0cnkge1xuICAgICAgICBvcHRpb25zID0gYXR0ciAmJiBKU09OLnBhcnNlKCBhdHRyICk7XG4gICAgICB9IGNhdGNoICggZXJyb3IgKSB7XG4gICAgICAgIC8vIGxvZyBlcnJvciwgZG8gbm90IGluaXRpYWxpemVcbiAgICAgICAgaWYgKCBjb25zb2xlICkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoIGBFcnJvciBwYXJzaW5nICR7ZGF0YUF0dHJ9IG9uICR7ZWxlbS5jbGFzc05hbWV9OiAke2Vycm9yfWAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBpbml0aWFsaXplXG4gICAgICBsZXQgaW5zdGFuY2UgPSBuZXcgV2lkZ2V0Q2xhc3MoIGVsZW0sIG9wdGlvbnMgKTtcbiAgICAgIC8vIG1ha2UgYXZhaWxhYmxlIHZpYSAkKCkuZGF0YSgnbmFtZXNwYWNlJylcbiAgICAgIGlmICggalF1ZXJ5ICkge1xuICAgICAgICBqUXVlcnkuZGF0YSggZWxlbSwgbmFtZXNwYWNlLCBpbnN0YW5jZSApO1xuICAgICAgfVxuICAgIH0gKTtcblxuICB9ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIHV0aWxzO1xuXG59ICkgKTtcbiIsIi8vIGFkZCwgcmVtb3ZlIGNlbGxcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgdXRpbHMgKSB7XG5cbi8vIGFwcGVuZCBjZWxscyB0byBhIGRvY3VtZW50IGZyYWdtZW50XG5mdW5jdGlvbiBnZXRDZWxsc0ZyYWdtZW50KCBjZWxscyApIHtcbiAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBjZWxscy5mb3JFYWNoKCAoIGNlbGwgKSA9PiBmcmFnbWVudC5hcHBlbmRDaGlsZCggY2VsbC5lbGVtZW50ICkgKTtcbiAgcmV0dXJuIGZyYWdtZW50O1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBhZGQvcmVtb3ZlIGNlbGwgcHJvdG90eXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmxldCBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxuLyoqXG4gKiBJbnNlcnQsIHByZXBlbmQsIG9yIGFwcGVuZCBjZWxsc1xuICogQHBhcmFtIHtbRWxlbWVudCwgQXJyYXksIE5vZGVMaXN0XX0gZWxlbXMgLSBFbGVtZW50cyB0byBpbnNlcnRcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBaZXJvLWJhc2VkIG51bWJlciB0byBpbnNlcnRcbiAqL1xucHJvdG8uaW5zZXJ0ID0gZnVuY3Rpb24oIGVsZW1zLCBpbmRleCApIHtcbiAgbGV0IGNlbGxzID0gdGhpcy5fbWFrZUNlbGxzKCBlbGVtcyApO1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIGxldCBsZW4gPSB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgLy8gZGVmYXVsdCB0byBhcHBlbmRcbiAgaW5kZXggPSBpbmRleCA9PT0gdW5kZWZpbmVkID8gbGVuIDogaW5kZXg7XG4gIC8vIGFkZCBjZWxscyB3aXRoIGRvY3VtZW50IGZyYWdtZW50XG4gIGxldCBmcmFnbWVudCA9IGdldENlbGxzRnJhZ21lbnQoIGNlbGxzICk7XG4gIC8vIGFwcGVuZCB0byBzbGlkZXJcbiAgbGV0IGlzQXBwZW5kID0gaW5kZXggPT09IGxlbjtcbiAgaWYgKCBpc0FwcGVuZCApIHtcbiAgICB0aGlzLnNsaWRlci5hcHBlbmRDaGlsZCggZnJhZ21lbnQgKTtcbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5zZXJ0Q2VsbEVsZW1lbnQgPSB0aGlzLmNlbGxzWyBpbmRleCBdLmVsZW1lbnQ7XG4gICAgdGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgaW5zZXJ0Q2VsbEVsZW1lbnQgKTtcbiAgfVxuICAvLyBhZGQgdG8gdGhpcy5jZWxsc1xuICBpZiAoIGluZGV4ID09PSAwICkge1xuICAgIC8vIHByZXBlbmQsIGFkZCB0byBzdGFydFxuICAgIHRoaXMuY2VsbHMgPSBjZWxscy5jb25jYXQoIHRoaXMuY2VsbHMgKTtcbiAgfSBlbHNlIGlmICggaXNBcHBlbmQgKSB7XG4gICAgLy8gYXBwZW5kLCBhZGQgdG8gZW5kXG4gICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuY29uY2F0KCBjZWxscyApO1xuICB9IGVsc2Uge1xuICAgIC8vIGluc2VydCBpbiB0aGlzLmNlbGxzXG4gICAgbGV0IGVuZENlbGxzID0gdGhpcy5jZWxscy5zcGxpY2UoIGluZGV4LCBsZW4gLSBpbmRleCApO1xuICAgIHRoaXMuY2VsbHMgPSB0aGlzLmNlbGxzLmNvbmNhdCggY2VsbHMgKS5jb25jYXQoIGVuZENlbGxzICk7XG4gIH1cblxuICB0aGlzLl9zaXplQ2VsbHMoIGNlbGxzICk7XG4gIHRoaXMuY2VsbENoYW5nZSggaW5kZXggKTtcbiAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbn07XG5cbnByb3RvLmFwcGVuZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdGhpcy5pbnNlcnQoIGVsZW1zLCB0aGlzLmNlbGxzLmxlbmd0aCApO1xufTtcblxucHJvdG8ucHJlcGVuZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdGhpcy5pbnNlcnQoIGVsZW1zLCAwICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBjZWxsc1xuICogQHBhcmFtIHtbRWxlbWVudCwgQXJyYXksIE5vZGVMaXN0XX0gZWxlbXMgLSBFTGVtZW50cyB0byByZW1vdmVcbiAqL1xucHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICBsZXQgY2VsbHMgPSB0aGlzLmdldENlbGxzKCBlbGVtcyApO1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIGxldCBtaW5DZWxsSW5kZXggPSB0aGlzLmNlbGxzLmxlbmd0aCAtIDE7XG4gIC8vIHJlbW92ZSBjZWxscyBmcm9tIGNvbGxlY3Rpb24gJiBET01cbiAgY2VsbHMuZm9yRWFjaCggKCBjZWxsICkgPT4ge1xuICAgIGNlbGwucmVtb3ZlKCk7XG4gICAgbGV0IGluZGV4ID0gdGhpcy5jZWxscy5pbmRleE9mKCBjZWxsICk7XG4gICAgbWluQ2VsbEluZGV4ID0gTWF0aC5taW4oIGluZGV4LCBtaW5DZWxsSW5kZXggKTtcbiAgICB1dGlscy5yZW1vdmVGcm9tKCB0aGlzLmNlbGxzLCBjZWxsICk7XG4gIH0gKTtcblxuICB0aGlzLmNlbGxDaGFuZ2UoIG1pbkNlbGxJbmRleCApO1xuICB0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpO1xufTtcblxuLyoqXG4gKiBsb2dpYyB0byBiZSBydW4gYWZ0ZXIgYSBjZWxsJ3Mgc2l6ZSBjaGFuZ2VzXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW0gLSBjZWxsJ3MgZWxlbWVudFxuICovXG5wcm90by5jZWxsU2l6ZUNoYW5nZSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBsZXQgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xuICBpZiAoICFjZWxsICkgcmV0dXJuO1xuXG4gIGNlbGwuZ2V0U2l6ZSgpO1xuXG4gIGxldCBpbmRleCA9IHRoaXMuY2VsbHMuaW5kZXhPZiggY2VsbCApO1xuICB0aGlzLmNlbGxDaGFuZ2UoIGluZGV4ICk7XG4gIC8vIGRvIG5vdCBwb3NpdGlvbiBzbGlkZXIgYWZ0ZXIgbGF6eSBsb2FkXG59O1xuXG4vKipcbiAqIGxvZ2ljIGFueSB0aW1lIGEgY2VsbCBpcyBjaGFuZ2VkOiBhZGRlZCwgcmVtb3ZlZCwgb3Igc2l6ZSBjaGFuZ2VkXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGNoYW5nZWRDZWxsSW5kZXggLSBpbmRleCBvZiB0aGUgY2hhbmdlZCBjZWxsLCBvcHRpb25hbFxuICovXG5wcm90by5jZWxsQ2hhbmdlID0gZnVuY3Rpb24oIGNoYW5nZWRDZWxsSW5kZXggKSB7XG4gIGxldCBwcmV2U2VsZWN0ZWRFbGVtID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQ7XG4gIHRoaXMuX3Bvc2l0aW9uQ2VsbHMoIGNoYW5nZWRDZWxsSW5kZXggKTtcbiAgdGhpcy5fdXBkYXRlV3JhcFNoaWZ0Q2VsbHMoKTtcbiAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWRJbmRleCwgdHJ5IHRvIG1haW50YWluIHBvc2l0aW9uICYgc2VsZWN0IHByZXZpb3VzIHNlbGVjdGVkIGVsZW1lbnRcbiAgbGV0IGNlbGwgPSB0aGlzLmdldENlbGwoIHByZXZTZWxlY3RlZEVsZW0gKTtcbiAgaWYgKCBjZWxsICkgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXRDZWxsU2xpZGVJbmRleCggY2VsbCApO1xuICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1pbiggdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSwgdGhpcy5zZWxlY3RlZEluZGV4ICk7XG5cbiAgdGhpcy5lbWl0RXZlbnQoICdjZWxsQ2hhbmdlJywgWyBjaGFuZ2VkQ2VsbEluZGV4IF0gKTtcbiAgLy8gcG9zaXRpb24gc2xpZGVyXG4gIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0gKSApO1xuIiwiLy8gYW5pbWF0ZVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCdmaXp6eS11aS11dGlscycpICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHkgfHwge307XG4gICAgd2luZG93LkZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGUgPSBmYWN0b3J5KCB3aW5kb3cuZml6enlVSVV0aWxzICk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uIGZhY3RvcnkoIHV0aWxzICkge1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBhbmltYXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmxldCBwcm90byA9IHt9O1xuXG5wcm90by5zdGFydEFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuaXNBbmltYXRpbmcgKSByZXR1cm47XG5cbiAgdGhpcy5pc0FuaW1hdGluZyA9IHRydWU7XG4gIHRoaXMucmVzdGluZ0ZyYW1lcyA9IDA7XG4gIHRoaXMuYW5pbWF0ZSgpO1xufTtcblxucHJvdG8uYW5pbWF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmFwcGx5RHJhZ0ZvcmNlKCk7XG4gIHRoaXMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24oKTtcblxuICBsZXQgcHJldmlvdXNYID0gdGhpcy54O1xuXG4gIHRoaXMuaW50ZWdyYXRlUGh5c2ljcygpO1xuICB0aGlzLnBvc2l0aW9uU2xpZGVyKCk7XG4gIHRoaXMuc2V0dGxlKCBwcmV2aW91c1ggKTtcbiAgLy8gYW5pbWF0ZSBuZXh0IGZyYW1lXG4gIGlmICggdGhpcy5pc0FuaW1hdGluZyApIHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4gdGhpcy5hbmltYXRlKCkgKTtcbn07XG5cbnByb3RvLnBvc2l0aW9uU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gIGxldCB4ID0gdGhpcy54O1xuICAvLyB3cmFwIHBvc2l0aW9uIGFyb3VuZFxuICBpZiAoIHRoaXMuaXNXcmFwcGluZyApIHtcbiAgICB4ID0gdXRpbHMubW9kdWxvKCB4LCB0aGlzLnNsaWRlYWJsZVdpZHRoICkgLSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICAgIHRoaXMuc2hpZnRXcmFwQ2VsbHMoIHggKTtcbiAgfVxuXG4gIHRoaXMuc2V0VHJhbnNsYXRlWCggeCwgdGhpcy5pc0FuaW1hdGluZyApO1xuICB0aGlzLmRpc3BhdGNoU2Nyb2xsRXZlbnQoKTtcbn07XG5cbnByb3RvLnNldFRyYW5zbGF0ZVggPSBmdW5jdGlvbiggeCwgaXMzZCApIHtcbiAgeCArPSB0aGlzLmN1cnNvclBvc2l0aW9uO1xuICAvLyByZXZlcnNlIGlmIHJpZ2h0LXRvLWxlZnQgYW5kIHVzaW5nIHRyYW5zZm9ybVxuICBpZiAoIHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCApIHggPSAteDtcbiAgbGV0IHRyYW5zbGF0ZVggPSB0aGlzLmdldFBvc2l0aW9uVmFsdWUoIHggKTtcbiAgLy8gdXNlIDNEIHRyYW5zZm9ybXMgZm9yIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBvbiBpT1NcbiAgLy8gYnV0IHVzZSAyRCB3aGVuIHNldHRsZWQsIGZvciBiZXR0ZXIgZm9udC1yZW5kZXJpbmdcbiAgdGhpcy5zbGlkZXIuc3R5bGUudHJhbnNmb3JtID0gaXMzZCA/XG4gICAgYHRyYW5zbGF0ZTNkKCR7dHJhbnNsYXRlWH0sMCwwKWAgOiBgdHJhbnNsYXRlWCgke3RyYW5zbGF0ZVh9KWA7XG59O1xuXG5wcm90by5kaXNwYXRjaFNjcm9sbEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gIGxldCBmaXJzdFNsaWRlID0gdGhpcy5zbGlkZXNbMF07XG4gIGlmICggIWZpcnN0U2xpZGUgKSByZXR1cm47XG5cbiAgbGV0IHBvc2l0aW9uWCA9IC10aGlzLnggLSBmaXJzdFNsaWRlLnRhcmdldDtcbiAgbGV0IHByb2dyZXNzID0gcG9zaXRpb25YIC8gdGhpcy5zbGlkZXNXaWR0aDtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc2Nyb2xsJywgbnVsbCwgWyBwcm9ncmVzcywgcG9zaXRpb25YIF0gKTtcbn07XG5cbnByb3RvLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmNlbGxzLmxlbmd0aCApIHJldHVybjtcblxuICB0aGlzLnggPSAtdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldDtcbiAgdGhpcy52ZWxvY2l0eSA9IDA7IC8vIHN0b3Agd29iYmxlXG4gIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbn07XG5cbnByb3RvLmdldFBvc2l0aW9uVmFsdWUgPSBmdW5jdGlvbiggcG9zaXRpb24gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbiApIHtcbiAgICAvLyBwZXJjZW50IHBvc2l0aW9uLCByb3VuZCB0byAyIGRpZ2l0cywgbGlrZSAxMi4zNCVcbiAgICByZXR1cm4gKCBNYXRoLnJvdW5kKCAoIHBvc2l0aW9uIC8gdGhpcy5zaXplLmlubmVyV2lkdGggKSAqIDEwMDAwICkgKiAwLjAxICkgKyAnJSc7XG4gIH0gZWxzZSB7XG4gICAgLy8gcGl4ZWwgcG9zaXRpb25pbmdcbiAgICByZXR1cm4gTWF0aC5yb3VuZCggcG9zaXRpb24gKSArICdweCc7XG4gIH1cbn07XG5cbnByb3RvLnNldHRsZSA9IGZ1bmN0aW9uKCBwcmV2aW91c1ggKSB7XG4gIC8vIGtlZXAgdHJhY2sgb2YgZnJhbWVzIHdoZXJlIHggaGFzbid0IG1vdmVkXG4gIGxldCBpc1Jlc3RpbmcgPSAhdGhpcy5pc1BvaW50ZXJEb3duICYmXG4gICAgICBNYXRoLnJvdW5kKCB0aGlzLnggKiAxMDAgKSA9PT0gTWF0aC5yb3VuZCggcHJldmlvdXNYICogMTAwICk7XG4gIGlmICggaXNSZXN0aW5nICkgdGhpcy5yZXN0aW5nRnJhbWVzKys7XG4gIC8vIHN0b3AgYW5pbWF0aW5nIGlmIHJlc3RpbmcgZm9yIDMgb3IgbW9yZSBmcmFtZXNcbiAgaWYgKCB0aGlzLnJlc3RpbmdGcmFtZXMgPiAyICkge1xuICAgIHRoaXMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmc7XG4gICAgLy8gcmVuZGVyIHBvc2l0aW9uIHdpdGggdHJhbnNsYXRlWCB3aGVuIHNldHRsZWRcbiAgICB0aGlzLnBvc2l0aW9uU2xpZGVyKCk7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc2V0dGxlJywgbnVsbCwgWyB0aGlzLnNlbGVjdGVkSW5kZXggXSApO1xuICB9XG59O1xuXG5wcm90by5zaGlmdFdyYXBDZWxscyA9IGZ1bmN0aW9uKCB4ICkge1xuICAvLyBzaGlmdCBiZWZvcmUgY2VsbHNcbiAgbGV0IGJlZm9yZUdhcCA9IHRoaXMuY3Vyc29yUG9zaXRpb24gKyB4O1xuICB0aGlzLl9zaGlmdENlbGxzKCB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMsIGJlZm9yZUdhcCwgLTEgKTtcbiAgLy8gc2hpZnQgYWZ0ZXIgY2VsbHNcbiAgbGV0IGFmdGVyR2FwID0gdGhpcy5zaXplLmlubmVyV2lkdGggLSAoIHggKyB0aGlzLnNsaWRlYWJsZVdpZHRoICsgdGhpcy5jdXJzb3JQb3NpdGlvbiApO1xuICB0aGlzLl9zaGlmdENlbGxzKCB0aGlzLmFmdGVyU2hpZnRDZWxscywgYWZ0ZXJHYXAsIDEgKTtcbn07XG5cbnByb3RvLl9zaGlmdENlbGxzID0gZnVuY3Rpb24oIGNlbGxzLCBnYXAsIHNoaWZ0ICkge1xuICBjZWxscy5mb3JFYWNoKCAoIGNlbGwgKSA9PiB7XG4gICAgbGV0IGNlbGxTaGlmdCA9IGdhcCA+IDAgPyBzaGlmdCA6IDA7XG4gICAgdGhpcy5fd3JhcFNoaWZ0Q2VsbCggY2VsbCwgY2VsbFNoaWZ0ICk7XG4gICAgZ2FwIC09IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB9ICk7XG59O1xuXG5wcm90by5fdW5zaGlmdENlbGxzID0gZnVuY3Rpb24oIGNlbGxzICkge1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIGNlbGxzLmZvckVhY2goICggY2VsbCApID0+IHRoaXMuX3dyYXBTaGlmdENlbGwoIGNlbGwsIDAgKSApO1xufTtcblxuLy8gQHBhcmFtIHtJbnRlZ2VyfSBzaGlmdCAtIDAsIDEsIG9yIC0xXG5wcm90by5fd3JhcFNoaWZ0Q2VsbCA9IGZ1bmN0aW9uKCBjZWxsLCBzaGlmdCApIHtcbiAgdGhpcy5fcmVuZGVyQ2VsbFBvc2l0aW9uKCBjZWxsLCBjZWxsLnggKyB0aGlzLnNsaWRlYWJsZVdpZHRoICogc2hpZnQgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBoeXNpY3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uaW50ZWdyYXRlUGh5c2ljcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnggKz0gdGhpcy52ZWxvY2l0eTtcbiAgdGhpcy52ZWxvY2l0eSAqPSB0aGlzLmdldEZyaWN0aW9uRmFjdG9yKCk7XG59O1xuXG5wcm90by5hcHBseUZvcmNlID0gZnVuY3Rpb24oIGZvcmNlICkge1xuICB0aGlzLnZlbG9jaXR5ICs9IGZvcmNlO1xufTtcblxucHJvdG8uZ2V0RnJpY3Rpb25GYWN0b3IgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIDEgLSB0aGlzLm9wdGlvbnNbIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID8gJ2ZyZWVTY3JvbGxGcmljdGlvbicgOiAnZnJpY3Rpb24nIF07XG59O1xuXG5wcm90by5nZXRSZXN0aW5nUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgLy8gbXkgdGhhbmtzIHRvIFN0ZXZlbiBXaXR0ZW5zLCB3aG8gc2ltcGxpZmllZCB0aGlzIG1hdGggZ3JlYXRseVxuICByZXR1cm4gdGhpcy54ICsgdGhpcy52ZWxvY2l0eSAvICggMSAtIHRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSApO1xufTtcblxucHJvdG8uYXBwbHlEcmFnRm9yY2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSB8fCAhdGhpcy5pc1BvaW50ZXJEb3duICkgcmV0dXJuO1xuXG4gIC8vIGNoYW5nZSB0aGUgcG9zaXRpb24gdG8gZHJhZyBwb3NpdGlvbiBieSBhcHBseWluZyBmb3JjZVxuICBsZXQgZHJhZ1ZlbG9jaXR5ID0gdGhpcy5kcmFnWCAtIHRoaXMueDtcbiAgbGV0IGRyYWdGb3JjZSA9IGRyYWdWZWxvY2l0eSAtIHRoaXMudmVsb2NpdHk7XG4gIHRoaXMuYXBwbHlGb3JjZSggZHJhZ0ZvcmNlICk7XG59O1xuXG5wcm90by5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAvLyBkbyBub3QgYXR0cmFjdCBpZiBwb2ludGVyIGRvd24gb3Igbm8gc2xpZGVzXG4gIGxldCBkcmFnRG93biA9IHRoaXMuaXNEcmFnZ2FibGUgJiYgdGhpcy5pc1BvaW50ZXJEb3duO1xuICBpZiAoIGRyYWdEb3duIHx8IHRoaXMuaXNGcmVlU2Nyb2xsaW5nIHx8ICF0aGlzLnNsaWRlcy5sZW5ndGggKSByZXR1cm47XG5cbiAgbGV0IGRpc3RhbmNlID0gdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCAqIC0xIC0gdGhpcy54O1xuICBsZXQgZm9yY2UgPSBkaXN0YW5jZSAqIHRoaXMub3B0aW9ucy5zZWxlY3RlZEF0dHJhY3Rpb247XG4gIHRoaXMuYXBwbHlGb3JjZSggZm9yY2UgKTtcbn07XG5cbnJldHVybiBwcm90bztcblxufSApICk7XG4iLCIvLyBGbGlja2l0eS5DZWxsXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoIHJlcXVpcmUoJ2dldC1zaXplJykgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuQ2VsbCA9IGZhY3RvcnkoIHdpbmRvdy5nZXRTaXplICk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uIGZhY3RvcnkoIGdldFNpemUgKSB7XG5cbmNvbnN0IGNlbGxDbGFzc05hbWUgPSAnZmxpY2tpdHktY2VsbCc7XG5cbmZ1bmN0aW9uIENlbGwoIGVsZW0gKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjZWxsQ2xhc3NOYW1lICk7XG5cbiAgdGhpcy54ID0gMDtcbiAgdGhpcy51bnNlbGVjdCgpO1xufVxuXG5sZXQgcHJvdG8gPSBDZWxsLnByb3RvdHlwZTtcblxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZXNldCBzdHlsZVxuICB0aGlzLnVuc2VsZWN0KCk7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCBjZWxsQ2xhc3NOYW1lICk7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbn07XG5cbnByb3RvLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG59O1xuXG5wcm90by5zZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXNlbGVjdGVkJyk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG59O1xuXG5wcm90by51bnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2VsZWN0ZWQnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG59O1xuXG5wcm90by5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xufTtcblxucmV0dXJuIENlbGw7XG5cbn0gKSApO1xuIiwiLy8gRmxpY2tpdHkgbWFpblxuLyogZXNsaW50LWRpc2FibGUgbWF4LXBhcmFtcyAqL1xuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKSxcbiAgICAgICAgcmVxdWlyZSgnZ2V0LXNpemUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICAgICAgcmVxdWlyZSgnLi9jZWxsJyksXG4gICAgICAgIHJlcXVpcmUoJy4vc2xpZGUnKSxcbiAgICAgICAgcmVxdWlyZSgnLi9hbmltYXRlJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGxldCBfRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHk7XG5cbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICAgIHdpbmRvdy5nZXRTaXplLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICAgICBfRmxpY2tpdHkuQ2VsbCxcbiAgICAgICAgX0ZsaWNraXR5LlNsaWRlLFxuICAgICAgICBfRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZSxcbiAgICApO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLFxuICAgIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyLCBnZXRTaXplLCB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKSB7XG4vKiBlc2xpbnQtZW5hYmxlIG1heC1wYXJhbXMgKi9cblxuLy8gdmFyc1xuY29uc3QgeyBnZXRDb21wdXRlZFN0eWxlLCBjb25zb2xlIH0gPSB3aW5kb3c7XG5sZXQgeyBqUXVlcnkgfSA9IHdpbmRvdztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRmxpY2tpdHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2xvYmFsbHkgdW5pcXVlIGlkZW50aWZpZXJzXG5sZXQgR1VJRCA9IDA7XG4vLyBpbnRlcm5hbCBzdG9yZSBvZiBhbGwgRmxpY2tpdHkgaW50YW5jZXNcbmxldCBpbnN0YW5jZXMgPSB7fTtcblxuZnVuY3Rpb24gRmxpY2tpdHkoIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIGxldCBxdWVyeUVsZW1lbnQgPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgaWYgKCAhcXVlcnlFbGVtZW50ICkge1xuICAgIGlmICggY29uc29sZSApIGNvbnNvbGUuZXJyb3IoYEJhZCBlbGVtZW50IGZvciBGbGlja2l0eTogJHtxdWVyeUVsZW1lbnQgfHwgZWxlbWVudH1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50ID0gcXVlcnlFbGVtZW50O1xuICAvLyBkbyBub3QgaW5pdGlhbGl6ZSB0d2ljZSBvbiBzYW1lIGVsZW1lbnRcbiAgaWYgKCB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEICkge1xuICAgIGxldCBpbnN0YW5jZSA9IGluc3RhbmNlc1sgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCBdO1xuICAgIGlmICggaW5zdGFuY2UgKSBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvLyBhZGQgalF1ZXJ5XG4gIGlmICggalF1ZXJ5ICkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBqUXVlcnkoIHRoaXMuZWxlbWVudCApO1xuICB9XG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0geyAuLi50aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzIH07XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG5cbiAgLy8ga2ljayB0aGluZ3Mgb2ZmXG4gIHRoaXMuX2NyZWF0ZSgpO1xufVxuXG5GbGlja2l0eS5kZWZhdWx0cyA9IHtcbiAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcbiAgLy8gYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICBjZWxsQWxpZ246ICdjZW50ZXInLFxuICAvLyBjZWxsU2VsZWN0b3I6IHVuZGVmaW5lZCxcbiAgLy8gY29udGFpbjogZmFsc2UsXG4gIGZyZWVTY3JvbGxGcmljdGlvbjogMC4wNzUsIC8vIGZyaWN0aW9uIHdoZW4gZnJlZS1zY3JvbGxpbmdcbiAgZnJpY3Rpb246IDAuMjgsIC8vIGZyaWN0aW9uIHdoZW4gc2VsZWN0aW5nXG4gIG5hbWVzcGFjZUpRdWVyeUV2ZW50czogdHJ1ZSxcbiAgLy8gaW5pdGlhbEluZGV4OiAwLFxuICBwZXJjZW50UG9zaXRpb246IHRydWUsXG4gIHJlc2l6ZTogdHJ1ZSxcbiAgc2VsZWN0ZWRBdHRyYWN0aW9uOiAwLjAyNSxcbiAgc2V0R2FsbGVyeVNpemU6IHRydWUsXG4gIC8vIHdhdGNoQ1NTOiBmYWxzZSxcbiAgLy8gd3JhcEFyb3VuZDogZmFsc2Vcbn07XG5cbi8vIGhhc2ggb2YgbWV0aG9kcyB0cmlnZ2VyZWQgb24gX2NyZWF0ZSgpXG5GbGlja2l0eS5jcmVhdGUgPSB7fTtcblxubGV0IHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuLy8gaW5oZXJpdCBFdmVudEVtaXR0ZXJcbk9iamVjdC5hc3NpZ24oIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbnByb3RvLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHsgcmVzaXplLCB3YXRjaENTUywgcmlnaHRUb0xlZnQgfSA9IHRoaXMub3B0aW9ucztcbiAgLy8gYWRkIGlkIGZvciBGbGlja2l0eS5kYXRhXG4gIGxldCBpZCA9IHRoaXMuZ3VpZCA9ICsrR1VJRDtcbiAgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCA9IGlkOyAvLyBleHBhbmRvXG4gIGluc3RhbmNlc1sgaWQgXSA9IHRoaXM7IC8vIGFzc29jaWF0ZSB2aWEgaWRcbiAgLy8gaW5pdGlhbCBwcm9wZXJ0aWVzXG4gIHRoaXMuc2VsZWN0ZWRJbmRleCA9IDA7XG4gIC8vIGhvdyBtYW55IGZyYW1lcyBzbGlkZXIgaGFzIGJlZW4gaW4gc2FtZSBwb3NpdGlvblxuICB0aGlzLnJlc3RpbmdGcmFtZXMgPSAwO1xuICAvLyBpbml0aWFsIHBoeXNpY3MgcHJvcGVydGllc1xuICB0aGlzLnggPSAwO1xuICB0aGlzLnZlbG9jaXR5ID0gMDtcbiAgdGhpcy5iZWdpbk1hcmdpbiA9IHJpZ2h0VG9MZWZ0ID8gJ21hcmdpblJpZ2h0JyA6ICdtYXJnaW5MZWZ0JztcbiAgdGhpcy5lbmRNYXJnaW4gPSByaWdodFRvTGVmdCA/ICdtYXJnaW5MZWZ0JyA6ICdtYXJnaW5SaWdodCc7XG4gIC8vIGNyZWF0ZSB2aWV3cG9ydCAmIHNsaWRlclxuICB0aGlzLnZpZXdwb3J0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRoaXMudmlld3BvcnQuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LXZpZXdwb3J0JztcbiAgdGhpcy5fY3JlYXRlU2xpZGVyKCk7XG4gIC8vIHVzZWQgZm9yIGtleWJvYXJkIG5hdmlnYXRpb25cbiAgdGhpcy5mb2N1c2FibGVFbGVtcyA9IFsgdGhpcy5lbGVtZW50IF07XG5cbiAgaWYgKCByZXNpemUgfHwgd2F0Y2hDU1MgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCB0aGlzICk7XG4gIH1cblxuICAvLyBhZGQgbGlzdGVuZXJzIGZyb20gb24gb3B0aW9uXG4gIGZvciAoIGxldCBldmVudE5hbWUgaW4gdGhpcy5vcHRpb25zLm9uICkge1xuICAgIGxldCBsaXN0ZW5lciA9IHRoaXMub3B0aW9ucy5vblsgZXZlbnROYW1lIF07XG4gICAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICB9XG5cbiAgZm9yICggbGV0IG1ldGhvZCBpbiBGbGlja2l0eS5jcmVhdGUgKSB7XG4gICAgRmxpY2tpdHkuY3JlYXRlWyBtZXRob2QgXS5jYWxsKCB0aGlzICk7XG4gIH1cblxuICBpZiAoIHdhdGNoQ1NTICkge1xuICAgIHRoaXMud2F0Y2hDU1MoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH1cbn07XG5cbi8qKlxuICogc2V0IG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzIC0gb3B0aW9ucyB0byBleHRlbmRcbiAqL1xucHJvdG8ub3B0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gIE9iamVjdC5hc3NpZ24oIHRoaXMub3B0aW9ucywgb3B0cyApO1xufTtcblxucHJvdG8uYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzQWN0aXZlICkgcmV0dXJuO1xuXG4gIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxpY2tpdHktZW5hYmxlZCcpO1xuICBpZiAoIHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCApIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmxpY2tpdHktcnRsJyk7XG4gIH1cblxuICB0aGlzLmdldFNpemUoKTtcbiAgLy8gbW92ZSBpbml0aWFsIGNlbGwgZWxlbWVudHMgc28gdGhleSBjYW4gYmUgbG9hZGVkIGFzIGNlbGxzXG4gIGxldCBjZWxsRWxlbXMgPSB0aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKCB0aGlzLmVsZW1lbnQuY2hpbGRyZW4gKTtcbiAgdGhpcy5zbGlkZXIuYXBwZW5kKCAuLi5jZWxsRWxlbXMgKTtcbiAgdGhpcy52aWV3cG9ydC5hcHBlbmQoIHRoaXMuc2xpZGVyICk7XG4gIHRoaXMuZWxlbWVudC5hcHBlbmQoIHRoaXMudmlld3BvcnQgKTtcbiAgLy8gZ2V0IGNlbGxzIGZyb20gY2hpbGRyZW5cbiAgdGhpcy5yZWxvYWRDZWxscygpO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgKSB7XG4gICAgLy8gYWxsb3cgZWxlbWVudCB0byBmb2N1c2FibGVcbiAgICB0aGlzLmVsZW1lbnQudGFiSW5kZXggPSAwO1xuICAgIC8vIGxpc3RlbiBmb3Iga2V5IHByZXNzZXNcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzICk7XG4gIH1cblxuICB0aGlzLmVtaXRFdmVudCgnYWN0aXZhdGUnKTtcbiAgdGhpcy5zZWxlY3RJbml0aWFsSW5kZXgoKTtcbiAgLy8gZmxhZyBmb3IgaW5pdGlhbCBhY3RpdmF0aW9uLCBmb3IgdXNpbmcgaW5pdGlhbEluZGV4XG4gIHRoaXMuaXNJbml0QWN0aXZhdGVkID0gdHJ1ZTtcbiAgLy8gcmVhZHkgZXZlbnQuICM0OTNcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCdyZWFkeScpO1xufTtcblxuLy8gc2xpZGVyIHBvc2l0aW9ucyB0aGUgY2VsbHNcbnByb3RvLl9jcmVhdGVTbGlkZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gc2xpZGVyIGVsZW1lbnQgZG9lcyBhbGwgdGhlIHBvc2l0aW9uaW5nXG4gIGxldCBzbGlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc2xpZGVyLmNsYXNzTmFtZSA9ICdmbGlja2l0eS1zbGlkZXInO1xuICB0aGlzLnNsaWRlciA9IHNsaWRlcjtcbn07XG5cbnByb3RvLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICByZXR1cm4gdXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzKCBlbGVtcywgdGhpcy5vcHRpb25zLmNlbGxTZWxlY3RvciApO1xufTtcblxuLy8gZ29lcyB0aHJvdWdoIGFsbCBjaGlsZHJlblxucHJvdG8ucmVsb2FkQ2VsbHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gY29sbGVjdGlvbiBvZiBpdGVtIGVsZW1lbnRzXG4gIHRoaXMuY2VsbHMgPSB0aGlzLl9tYWtlQ2VsbHMoIHRoaXMuc2xpZGVyLmNoaWxkcmVuICk7XG4gIHRoaXMucG9zaXRpb25DZWxscygpO1xuICB0aGlzLl91cGRhdGVXcmFwU2hpZnRDZWxscygpO1xuICB0aGlzLnNldEdhbGxlcnlTaXplKCk7XG59O1xuXG4vKipcbiAqIHR1cm4gZWxlbWVudHMgaW50byBGbGlja2l0eS5DZWxsc1xuICogQHBhcmFtIHtbQXJyYXksIE5vZGVMaXN0LCBIVE1MRWxlbWVudF19IGVsZW1zIC0gZWxlbWVudHMgdG8gbWFrZSBpbnRvIGNlbGxzXG4gKiBAcmV0dXJucyB7QXJyYXl9IGl0ZW1zIC0gY29sbGVjdGlvbiBvZiBuZXcgRmxpY2tpdHkgQ2VsbHNcbiAqL1xucHJvdG8uX21ha2VDZWxscyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgbGV0IGNlbGxFbGVtcyA9IHRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMoIGVsZW1zICk7XG5cbiAgLy8gY3JlYXRlIG5ldyBDZWxscyBmb3IgY29sbGVjdGlvblxuICByZXR1cm4gY2VsbEVsZW1zLm1hcCggKCBjZWxsRWxlbSApID0+IG5ldyBDZWxsKCBjZWxsRWxlbSApICk7XG59O1xuXG5wcm90by5nZXRMYXN0Q2VsbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxsc1sgdGhpcy5jZWxscy5sZW5ndGggLSAxIF07XG59O1xuXG5wcm90by5nZXRMYXN0U2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc2xpZGVzWyB0aGlzLnNsaWRlcy5sZW5ndGggLSAxIF07XG59O1xuXG4vLyBwb3NpdGlvbnMgYWxsIGNlbGxzXG5wcm90by5wb3NpdGlvbkNlbGxzID0gZnVuY3Rpb24oKSB7XG4gIC8vIHNpemUgYWxsIGNlbGxzXG4gIHRoaXMuX3NpemVDZWxscyggdGhpcy5jZWxscyApO1xuICAvLyBwb3NpdGlvbiBhbGwgY2VsbHNcbiAgdGhpcy5fcG9zaXRpb25DZWxscyggMCApO1xufTtcblxuLyoqXG4gKiBwb3NpdGlvbiBjZXJ0YWluIGNlbGxzXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGluZGV4IC0gd2hpY2ggY2VsbCB0byBzdGFydCB3aXRoXG4gKi9cbnByb3RvLl9wb3NpdGlvbkNlbGxzID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICBpbmRleCA9IGluZGV4IHx8IDA7XG4gIC8vIGFsc28gbWVhc3VyZSBtYXhDZWxsSGVpZ2h0XG4gIC8vIHN0YXJ0IDAgaWYgcG9zaXRpb25pbmcgYWxsIGNlbGxzXG4gIHRoaXMubWF4Q2VsbEhlaWdodCA9IGluZGV4ID8gdGhpcy5tYXhDZWxsSGVpZ2h0IHx8IDAgOiAwO1xuICBsZXQgY2VsbFggPSAwO1xuICAvLyBnZXQgY2VsbFhcbiAgaWYgKCBpbmRleCA+IDAgKSB7XG4gICAgbGV0IHN0YXJ0Q2VsbCA9IHRoaXMuY2VsbHNbIGluZGV4IC0gMSBdO1xuICAgIGNlbGxYID0gc3RhcnRDZWxsLnggKyBzdGFydENlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB9XG5cbiAgdGhpcy5jZWxscy5zbGljZSggaW5kZXggKS5mb3JFYWNoKCAoIGNlbGwgKSA9PiB7XG4gICAgY2VsbC54ID0gY2VsbFg7XG4gICAgdGhpcy5fcmVuZGVyQ2VsbFBvc2l0aW9uKCBjZWxsLCBjZWxsWCApO1xuICAgIGNlbGxYICs9IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICAgIHRoaXMubWF4Q2VsbEhlaWdodCA9IE1hdGgubWF4KCBjZWxsLnNpemUub3V0ZXJIZWlnaHQsIHRoaXMubWF4Q2VsbEhlaWdodCApO1xuICB9ICk7XG4gIC8vIGtlZXAgdHJhY2sgb2YgY2VsbFggZm9yIHdyYXAtYXJvdW5kXG4gIHRoaXMuc2xpZGVhYmxlV2lkdGggPSBjZWxsWDtcbiAgLy8gc2xpZGVzXG4gIHRoaXMudXBkYXRlU2xpZGVzKCk7XG4gIC8vIGNvbnRhaW4gc2xpZGVzIHRhcmdldFxuICB0aGlzLl9jb250YWluU2xpZGVzKCk7XG4gIC8vIHVwZGF0ZSBzbGlkZXNXaWR0aFxuICB0aGlzLnNsaWRlc1dpZHRoID0gdGhpcy5jZWxscy5sZW5ndGggP1xuICAgIHRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0IC0gdGhpcy5zbGlkZXNbMF0udGFyZ2V0IDogMDtcbn07XG5cbnByb3RvLl9yZW5kZXJDZWxsUG9zaXRpb24gPSBmdW5jdGlvbiggY2VsbCwgeCApIHtcbiAgLy8gcmVuZGVyIHBvc2l0aW9uIG9mIGNlbGwgd2l0aCBpbiBzbGlkZXJcbiAgbGV0IHNpZGVPZmZzZXQgPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAtMSA6IDE7XG4gIGxldCByZW5kZXJYID0geCAqIHNpZGVPZmZzZXQ7XG4gIGlmICggdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbiApIHJlbmRlclggKj0gdGhpcy5zaXplLmlubmVyV2lkdGggLyBjZWxsLnNpemUud2lkdGg7XG4gIGxldCBwb3NpdGlvblZhbHVlID0gdGhpcy5nZXRQb3NpdGlvblZhbHVlKCByZW5kZXJYICk7XG4gIGNlbGwuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlWCggJHtwb3NpdGlvblZhbHVlfSApYDtcbn07XG5cbi8qKlxuICogY2VsbC5nZXRTaXplKCkgb24gbXVsdGlwbGUgY2VsbHNcbiAqIEBwYXJhbSB7QXJyYXl9IGNlbGxzIC0gY2VsbHMgdG8gc2l6ZVxuICovXG5wcm90by5fc2l6ZUNlbGxzID0gZnVuY3Rpb24oIGNlbGxzICkge1xuICBjZWxscy5mb3JFYWNoKCAoIGNlbGwgKSA9PiBjZWxsLmdldFNpemUoKSApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZVNsaWRlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNsaWRlcyA9IFtdO1xuICBpZiAoICF0aGlzLmNlbGxzLmxlbmd0aCApIHJldHVybjtcblxuICBsZXQgeyBiZWdpbk1hcmdpbiwgZW5kTWFyZ2luIH0gPSB0aGlzO1xuICBsZXQgc2xpZGUgPSBuZXcgU2xpZGUoIGJlZ2luTWFyZ2luLCBlbmRNYXJnaW4sIHRoaXMuY2VsbEFsaWduICk7XG4gIHRoaXMuc2xpZGVzLnB1c2goIHNsaWRlICk7XG5cbiAgbGV0IGNhbkNlbGxGaXQgPSB0aGlzLl9nZXRDYW5DZWxsRml0KCk7XG5cbiAgdGhpcy5jZWxscy5mb3JFYWNoKCAoIGNlbGwsIGkgKSA9PiB7XG4gICAgLy8ganVzdCBhZGQgY2VsbCBpZiBmaXJzdCBjZWxsIGluIHNsaWRlXG4gICAgaWYgKCAhc2xpZGUuY2VsbHMubGVuZ3RoICkge1xuICAgICAgc2xpZGUuYWRkQ2VsbCggY2VsbCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBzbGlkZVdpZHRoID0gKCBzbGlkZS5vdXRlcldpZHRoIC0gc2xpZGUuZmlyc3RNYXJnaW4gKSArXG4gICAgICAoIGNlbGwuc2l6ZS5vdXRlcldpZHRoIC0gY2VsbC5zaXplWyBlbmRNYXJnaW4gXSApO1xuXG4gICAgaWYgKCBjYW5DZWxsRml0KCBpLCBzbGlkZVdpZHRoICkgKSB7XG4gICAgICBzbGlkZS5hZGRDZWxsKCBjZWxsICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRvZXNuJ3QgZml0LCBuZXcgc2xpZGVcbiAgICAgIHNsaWRlLnVwZGF0ZVRhcmdldCgpO1xuXG4gICAgICBzbGlkZSA9IG5ldyBTbGlkZSggYmVnaW5NYXJnaW4sIGVuZE1hcmdpbiwgdGhpcy5jZWxsQWxpZ24gKTtcbiAgICAgIHRoaXMuc2xpZGVzLnB1c2goIHNsaWRlICk7XG4gICAgICBzbGlkZS5hZGRDZWxsKCBjZWxsICk7XG4gICAgfVxuICB9ICk7XG4gIC8vIGxhc3Qgc2xpZGVcbiAgc2xpZGUudXBkYXRlVGFyZ2V0KCk7XG4gIC8vIHVwZGF0ZSAuc2VsZWN0ZWRTbGlkZVxuICB0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKTtcbn07XG5cbnByb3RvLl9nZXRDYW5DZWxsRml0ID0gZnVuY3Rpb24oKSB7XG4gIGxldCB7IGdyb3VwQ2VsbHMgfSA9IHRoaXMub3B0aW9ucztcbiAgaWYgKCAhZ3JvdXBDZWxscyApIHJldHVybiAoKSA9PiBmYWxzZTtcblxuICBpZiAoIHR5cGVvZiBncm91cENlbGxzID09ICdudW1iZXInICkge1xuICAgIC8vIGdyb3VwIGJ5IG51bWJlci4gMyAtPiBbMCwxLDJdLCBbMyw0LDVdLCAuLi5cbiAgICBsZXQgbnVtYmVyID0gcGFyc2VJbnQoIGdyb3VwQ2VsbHMsIDEwICk7XG4gICAgcmV0dXJuICggaSApID0+ICggaSAlIG51bWJlciApICE9PSAwO1xuICB9XG4gIC8vIGRlZmF1bHQsIGdyb3VwIGJ5IHdpZHRoIG9mIHNsaWRlXG4gIGxldCBwZXJjZW50ID0gMTtcbiAgLy8gcGFyc2UgJzc1JVxuICBsZXQgcGVyY2VudE1hdGNoID0gdHlwZW9mIGdyb3VwQ2VsbHMgPT0gJ3N0cmluZycgJiYgZ3JvdXBDZWxscy5tYXRjaCggL14oXFxkKyklJC8gKTtcbiAgaWYgKCBwZXJjZW50TWF0Y2ggKSBwZXJjZW50ID0gcGFyc2VJbnQoIHBlcmNlbnRNYXRjaFsxXSwgMTAgKSAvIDEwMDtcbiAgbGV0IGdyb3VwV2lkdGggPSAoIHRoaXMuc2l6ZS5pbm5lcldpZHRoICsgMSApICogcGVyY2VudDtcbiAgcmV0dXJuICggaSwgc2xpZGVXaWR0aCApID0+IHNsaWRlV2lkdGggPD0gZ3JvdXBXaWR0aDtcbn07XG5cbi8vIGFsaWFzIF9pbml0IGZvciBqUXVlcnkgcGx1Z2luIC5mbGlja2l0eSgpXG5wcm90by5faW5pdCA9XG5wcm90by5yZXBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucG9zaXRpb25DZWxscygpO1xuICB0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpO1xufTtcblxucHJvdG8uZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQgKTtcbiAgdGhpcy5zZXRDZWxsQWxpZ24oKTtcbiAgdGhpcy5jdXJzb3JQb3NpdGlvbiA9IHRoaXMuc2l6ZS5pbm5lcldpZHRoICogdGhpcy5jZWxsQWxpZ247XG59O1xuXG5sZXQgY2VsbEFsaWduU2hvcnRoYW5kcyA9IHtcbiAgbGVmdDogMCxcbiAgY2VudGVyOiAwLjUsXG4gIHJpZ2h0OiAxLFxufTtcblxucHJvdG8uc2V0Q2VsbEFsaWduID0gZnVuY3Rpb24oKSB7XG4gIGxldCB7IGNlbGxBbGlnbiwgcmlnaHRUb0xlZnQgfSA9IHRoaXMub3B0aW9ucztcbiAgbGV0IHNob3J0aGFuZCA9IGNlbGxBbGlnblNob3J0aGFuZHNbIGNlbGxBbGlnbiBdO1xuICB0aGlzLmNlbGxBbGlnbiA9IHNob3J0aGFuZCAhPT0gdW5kZWZpbmVkID8gc2hvcnRoYW5kIDogY2VsbEFsaWduO1xuICBpZiAoIHJpZ2h0VG9MZWZ0ICkgdGhpcy5jZWxsQWxpZ24gPSAxIC0gdGhpcy5jZWxsQWxpZ247XG59O1xuXG5wcm90by5zZXRHYWxsZXJ5U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUgKSByZXR1cm47XG5cbiAgbGV0IGhlaWdodCA9IHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCAmJiB0aGlzLnNlbGVjdGVkU2xpZGUgP1xuICAgIHRoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQgOiB0aGlzLm1heENlbGxIZWlnaHQ7XG4gIHRoaXMudmlld3BvcnQuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbn07XG5cbnByb3RvLl91cGRhdGVXcmFwU2hpZnRDZWxscyA9IGZ1bmN0aW9uKCkge1xuICAvLyB1cGRhdGUgaXNXcmFwcGluZ1xuICB0aGlzLmlzV3JhcHBpbmcgPSB0aGlzLmdldElzV3JhcHBpbmcoKTtcbiAgLy8gb25seSBmb3Igd3JhcC1hcm91bmRcbiAgaWYgKCAhdGhpcy5pc1dyYXBwaW5nICkgcmV0dXJuO1xuXG4gIC8vIHVuc2hpZnQgcHJldmlvdXMgY2VsbHNcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMgKTtcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmFmdGVyU2hpZnRDZWxscyApO1xuICAvLyBnZXQgYmVmb3JlIGNlbGxzXG4gIC8vIGluaXRpYWwgZ2FwXG4gIGxldCBiZWZvcmVHYXBYID0gdGhpcy5jdXJzb3JQb3NpdGlvbjtcbiAgbGV0IGxhc3RJbmRleCA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTtcbiAgdGhpcy5iZWZvcmVTaGlmdENlbGxzID0gdGhpcy5fZ2V0R2FwQ2VsbHMoIGJlZm9yZUdhcFgsIGxhc3RJbmRleCwgLTEgKTtcbiAgLy8gZ2V0IGFmdGVyIGNlbGxzXG4gIC8vIGVuZGluZyBnYXAgYmV0d2VlbiBsYXN0IGNlbGwgYW5kIGVuZCBvZiBnYWxsZXJ5IHZpZXdwb3J0XG4gIGxldCBhZnRlckdhcFggPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAtIHRoaXMuY3Vyc29yUG9zaXRpb247XG4gIC8vIHN0YXJ0IGNsb25pbmcgYXQgZmlyc3QgY2VsbCwgd29ya2luZyBmb3J3YXJkc1xuICB0aGlzLmFmdGVyU2hpZnRDZWxscyA9IHRoaXMuX2dldEdhcENlbGxzKCBhZnRlckdhcFgsIDAsIDEgKTtcbn07XG5cbnByb3RvLmdldElzV3JhcHBpbmcgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHsgd3JhcEFyb3VuZCB9ID0gdGhpcy5vcHRpb25zO1xuICBpZiAoICF3cmFwQXJvdW5kIHx8IHRoaXMuc2xpZGVzLmxlbmd0aCA8IDIgKSByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKCB3cmFwQXJvdW5kICE9PSAnZmlsbCcgKSByZXR1cm4gdHJ1ZTtcbiAgLy8gY2hlY2sgdGhhdCBzbGlkZXMgY2FuIGZpdFxuXG4gIGxldCBnYXBXaWR0aCA9IHRoaXMuc2xpZGVhYmxlV2lkdGggLSB0aGlzLnNpemUuaW5uZXJXaWR0aDtcbiAgaWYgKCBnYXBXaWR0aCA+IHRoaXMuc2l6ZS5pbm5lcldpZHRoICkgcmV0dXJuIHRydWU7IC8vIGdhcCAqIDJ4IGJpZywgYWxsIGdvb2RcbiAgLy8gY2hlY2sgdGhhdCBjb250ZW50IHdpZHRoIC0gc2hpZnRpbmcgY2VsbCBpcyBiaWdnZXIgdGhhbiB2aWV3cG9ydCB3aWR0aFxuICBmb3IgKCBsZXQgY2VsbCBvZiB0aGlzLmNlbGxzICkge1xuICAgIGlmICggY2VsbC5zaXplLm91dGVyV2lkdGggPiBnYXBXaWR0aCApIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbnByb3RvLl9nZXRHYXBDZWxscyA9IGZ1bmN0aW9uKCBnYXBYLCBjZWxsSW5kZXgsIGluY3JlbWVudCApIHtcbiAgLy8ga2VlcCBhZGRpbmcgY2VsbHMgdW50aWwgdGhlIGNvdmVyIHRoZSBpbml0aWFsIGdhcFxuICBsZXQgY2VsbHMgPSBbXTtcbiAgd2hpbGUgKCBnYXBYID4gMCApIHtcbiAgICBsZXQgY2VsbCA9IHRoaXMuY2VsbHNbIGNlbGxJbmRleCBdO1xuICAgIGlmICggIWNlbGwgKSBicmVhaztcblxuICAgIGNlbGxzLnB1c2goIGNlbGwgKTtcbiAgICBjZWxsSW5kZXggKz0gaW5jcmVtZW50O1xuICAgIGdhcFggLT0gY2VsbC5zaXplLm91dGVyV2lkdGg7XG4gIH1cbiAgcmV0dXJuIGNlbGxzO1xufTtcblxuLy8gLS0tLS0gY29udGFpbiAmIHdyYXAgLS0tLS0gLy9cblxuLy8gY29udGFpbiBjZWxsIHRhcmdldHMgc28gbm8gZXhjZXNzIHNsaWRpbmdcbnByb3RvLl9jb250YWluU2xpZGVzID0gZnVuY3Rpb24oKSB7XG4gIGxldCBpc0NvbnRhaW5pbmcgPSB0aGlzLm9wdGlvbnMuY29udGFpbiAmJiAhdGhpcy5pc1dyYXBwaW5nICYmXG4gICAgICB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgaWYgKCAhaXNDb250YWluaW5nICkgcmV0dXJuO1xuXG4gIGxldCBjb250ZW50V2lkdGggPSB0aGlzLnNsaWRlYWJsZVdpZHRoIC0gdGhpcy5nZXRMYXN0Q2VsbCgpLnNpemVbIHRoaXMuZW5kTWFyZ2luIF07XG4gIC8vIGNvbnRlbnQgaXMgbGVzcyB0aGFuIGdhbGxlcnkgc2l6ZVxuICBsZXQgaXNDb250ZW50U21hbGxlciA9IGNvbnRlbnRXaWR0aCA8IHRoaXMuc2l6ZS5pbm5lcldpZHRoO1xuICBpZiAoIGlzQ29udGVudFNtYWxsZXIgKSB7XG4gICAgLy8gYWxsIGNlbGxzIGZpdCBpbnNpZGUgZ2FsbGVyeVxuICAgIHRoaXMuc2xpZGVzLmZvckVhY2goICggc2xpZGUgKSA9PiB7XG4gICAgICBzbGlkZS50YXJnZXQgPSBjb250ZW50V2lkdGggKiB0aGlzLmNlbGxBbGlnbjtcbiAgICB9ICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gY29udGFpbiB0byBib3VuZHNcbiAgICBsZXQgYmVnaW5Cb3VuZCA9IHRoaXMuY3Vyc29yUG9zaXRpb24gKyB0aGlzLmNlbGxzWzBdLnNpemVbIHRoaXMuYmVnaW5NYXJnaW4gXTtcbiAgICBsZXQgZW5kQm91bmQgPSBjb250ZW50V2lkdGggLSB0aGlzLnNpemUuaW5uZXJXaWR0aCAqICggMSAtIHRoaXMuY2VsbEFsaWduICk7XG4gICAgdGhpcy5zbGlkZXMuZm9yRWFjaCggKCBzbGlkZSApID0+IHtcbiAgICAgIHNsaWRlLnRhcmdldCA9IE1hdGgubWF4KCBzbGlkZS50YXJnZXQsIGJlZ2luQm91bmQgKTtcbiAgICAgIHNsaWRlLnRhcmdldCA9IE1hdGgubWluKCBzbGlkZS50YXJnZXQsIGVuZEJvdW5kICk7XG4gICAgfSApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBldmVudHMgLS0tLS0gLy9cblxuLyoqXG4gKiBlbWl0cyBldmVudHMgdmlhIGV2ZW50RW1pdHRlciBhbmQgalF1ZXJ5IGV2ZW50c1xuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBuYW1lIG9mIGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIG9yaWdpbmFsIGV2ZW50XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIC0gZXh0cmEgYXJndW1lbnRzXG4gKi9cbnByb3RvLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiggdHlwZSwgZXZlbnQsIGFyZ3MgKSB7XG4gIGxldCBlbWl0QXJncyA9IGV2ZW50ID8gWyBldmVudCBdLmNvbmNhdCggYXJncyApIDogYXJncztcbiAgdGhpcy5lbWl0RXZlbnQoIHR5cGUsIGVtaXRBcmdzICk7XG5cbiAgaWYgKCBqUXVlcnkgJiYgdGhpcy4kZWxlbWVudCApIHtcbiAgICAvLyBkZWZhdWx0IHRyaWdnZXIgd2l0aCB0eXBlIGlmIG5vIGV2ZW50XG4gICAgdHlwZSArPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzID8gJy5mbGlja2l0eScgOiAnJztcbiAgICBsZXQgJGV2ZW50ID0gdHlwZTtcbiAgICBpZiAoIGV2ZW50ICkge1xuICAgICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgICAgbGV0IGpRRXZlbnQgPSBuZXcgalF1ZXJ5LkV2ZW50KCBldmVudCApO1xuICAgICAgalFFdmVudC50eXBlID0gdHlwZTtcbiAgICAgICRldmVudCA9IGpRRXZlbnQ7XG4gICAgfVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG4gIH1cbn07XG5cbmNvbnN0IHVuaWRyYWdnZXJFdmVudHMgPSBbXG4gICdkcmFnU3RhcnQnLFxuICAnZHJhZ01vdmUnLFxuICAnZHJhZ0VuZCcsXG4gICdwb2ludGVyRG93bicsXG4gICdwb2ludGVyTW92ZScsXG4gICdwb2ludGVyRW5kJyxcbiAgJ3N0YXRpY0NsaWNrJyxcbl07XG5cbmxldCBfZW1pdEV2ZW50ID0gcHJvdG8uZW1pdEV2ZW50O1xucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgaWYgKCBldmVudE5hbWUgPT09ICdzdGF0aWNDbGljaycgKSB7XG4gICAgLy8gYWRkIGNlbGxFbGVtIGFuZCBjZWxsSW5kZXggYXJncyB0byBzdGF0aWNDbGlja1xuICAgIGxldCBjbGlja2VkQ2VsbCA9IHRoaXMuZ2V0UGFyZW50Q2VsbCggYXJnc1swXS50YXJnZXQgKTtcbiAgICBsZXQgY2VsbEVsZW0gPSBjbGlja2VkQ2VsbCAmJiBjbGlja2VkQ2VsbC5lbGVtZW50O1xuICAgIGxldCBjZWxsSW5kZXggPSBjbGlja2VkQ2VsbCAmJiB0aGlzLmNlbGxzLmluZGV4T2YoIGNsaWNrZWRDZWxsICk7XG4gICAgYXJncyA9IGFyZ3MuY29uY2F0KCBjZWxsRWxlbSwgY2VsbEluZGV4ICk7XG4gIH1cbiAgLy8gZG8gcmVndWxhciB0aGluZ1xuICBfZW1pdEV2ZW50LmNhbGwoIHRoaXMsIGV2ZW50TmFtZSwgYXJncyApO1xuICAvLyBkdWNrLXB1bmNoIGluIGpRdWVyeSBldmVudHMgZm9yIFVuaWRyYWdnZXIgZXZlbnRzXG4gIGxldCBpc1VuaWRyYWdnZXJFdmVudCA9IHVuaWRyYWdnZXJFdmVudHMuaW5jbHVkZXMoIGV2ZW50TmFtZSApO1xuICBpZiAoICFpc1VuaWRyYWdnZXJFdmVudCB8fCAhalF1ZXJ5IHx8ICF0aGlzLiRlbGVtZW50ICkgcmV0dXJuO1xuXG4gIGV2ZW50TmFtZSArPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzID8gJy5mbGlja2l0eScgOiAnJztcbiAgbGV0IGV2ZW50ID0gYXJncy5zaGlmdCggMCApO1xuICBsZXQgalFFdmVudCA9IG5ldyBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gIGpRRXZlbnQudHlwZSA9IGV2ZW50TmFtZTtcbiAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCBqUUV2ZW50LCBhcmdzICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzZWxlY3QgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGluZGV4IC0gaW5kZXggb2YgdGhlIHNsaWRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzV3JhcCAtIHdpbGwgd3JhcC1hcm91bmQgdG8gbGFzdC9maXJzdCBpZiBhdCB0aGUgZW5kXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW5zdGFudCAtIHdpbGwgaW1tZWRpYXRlbHkgc2V0IHBvc2l0aW9uIGF0IHNlbGVjdGVkIGNlbGxcbiAqL1xucHJvdG8uc2VsZWN0ID0gZnVuY3Rpb24oIGluZGV4LCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHJldHVybjtcblxuICBpbmRleCA9IHBhcnNlSW50KCBpbmRleCwgMTAgKTtcbiAgdGhpcy5fd3JhcFNlbGVjdCggaW5kZXggKTtcblxuICBpZiAoIHRoaXMuaXNXcmFwcGluZyB8fCBpc1dyYXAgKSB7XG4gICAgaW5kZXggPSB1dGlscy5tb2R1bG8oIGluZGV4LCB0aGlzLnNsaWRlcy5sZW5ndGggKTtcbiAgfVxuICAvLyBiYWlsIGlmIGludmFsaWQgaW5kZXhcbiAgaWYgKCAhdGhpcy5zbGlkZXNbIGluZGV4IF0gKSByZXR1cm47XG5cbiAgbGV0IHByZXZJbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgdGhpcy5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gIHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpO1xuICBpZiAoIGlzSW5zdGFudCApIHtcbiAgICB0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3RhcnRBbmltYXRpb24oKTtcbiAgfVxuICBpZiAoIHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCApIHtcbiAgICB0aGlzLnNldEdhbGxlcnlTaXplKCk7XG4gIH1cbiAgLy8gZXZlbnRzXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3NlbGVjdCcsIG51bGwsIFsgaW5kZXggXSApO1xuICAvLyBjaGFuZ2UgZXZlbnQgaWYgbmV3IGluZGV4XG4gIGlmICggaW5kZXggIT09IHByZXZJbmRleCApIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdjaGFuZ2UnLCBudWxsLCBbIGluZGV4IF0gKTtcbiAgfVxufTtcblxuLy8gd3JhcHMgcG9zaXRpb24gZm9yIHdyYXBBcm91bmQsIHRvIG1vdmUgdG8gY2xvc2VzdCBzbGlkZS4gIzExM1xucHJvdG8uX3dyYXBTZWxlY3QgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gIGlmICggIXRoaXMuaXNXcmFwcGluZyApIHJldHVybjtcblxuICBjb25zdCB7IHNlbGVjdGVkSW5kZXgsIHNsaWRlYWJsZVdpZHRoLCBzbGlkZXM6IHsgbGVuZ3RoIH0gfSA9IHRoaXM7XG4gIC8vIHNoaWZ0IGluZGV4IGZvciB3cmFwLCBkbyBub3Qgd3JhcCBkcmFnU2VsZWN0XG4gIGlmICggIXRoaXMuaXNEcmFnU2VsZWN0ICkge1xuICAgIGxldCB3cmFwSW5kZXggPSB1dGlscy5tb2R1bG8oIGluZGV4LCBsZW5ndGggKTtcbiAgICAvLyBnbyB0byBzaG9ydGVzdFxuICAgIGxldCBkZWx0YSA9IE1hdGguYWJzKCB3cmFwSW5kZXggLSBzZWxlY3RlZEluZGV4ICk7XG4gICAgbGV0IGJhY2tXcmFwRGVsdGEgPSBNYXRoLmFicyggKCB3cmFwSW5kZXggKyBsZW5ndGggKSAtIHNlbGVjdGVkSW5kZXggKTtcbiAgICBsZXQgZm9yZXdhcmRXcmFwRGVsdGEgPSBNYXRoLmFicyggKCB3cmFwSW5kZXggLSBsZW5ndGggKSAtIHNlbGVjdGVkSW5kZXggKTtcbiAgICBpZiAoIGJhY2tXcmFwRGVsdGEgPCBkZWx0YSApIHtcbiAgICAgIGluZGV4ICs9IGxlbmd0aDtcbiAgICB9IGVsc2UgaWYgKCBmb3Jld2FyZFdyYXBEZWx0YSA8IGRlbHRhICkge1xuICAgICAgaW5kZXggLT0gbGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIC8vIHdyYXAgcG9zaXRpb24gc28gc2xpZGVyIGlzIHdpdGhpbiBub3JtYWwgYXJlYVxuICBpZiAoIGluZGV4IDwgMCApIHtcbiAgICB0aGlzLnggLT0gc2xpZGVhYmxlV2lkdGg7XG4gIH0gZWxzZSBpZiAoIGluZGV4ID49IGxlbmd0aCApIHtcbiAgICB0aGlzLnggKz0gc2xpZGVhYmxlV2lkdGg7XG4gIH1cbn07XG5cbnByb3RvLnByZXZpb3VzID0gZnVuY3Rpb24oIGlzV3JhcCwgaXNJbnN0YW50ICkge1xuICB0aGlzLnNlbGVjdCggdGhpcy5zZWxlY3RlZEluZGV4IC0gMSwgaXNXcmFwLCBpc0luc3RhbnQgKTtcbn07XG5cbnByb3RvLm5leHQgPSBmdW5jdGlvbiggaXNXcmFwLCBpc0luc3RhbnQgKSB7XG4gIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXggKyAxLCBpc1dyYXAsIGlzSW5zdGFudCApO1xufTtcblxucHJvdG8udXBkYXRlU2VsZWN0ZWRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2xpZGUgPSB0aGlzLnNsaWRlc1sgdGhpcy5zZWxlY3RlZEluZGV4IF07XG4gIC8vIHNlbGVjdGVkSW5kZXggY291bGQgYmUgb3V0c2lkZSBvZiBzbGlkZXMsIGlmIHRyaWdnZXJlZCBiZWZvcmUgcmVzaXplKClcbiAgaWYgKCAhc2xpZGUgKSByZXR1cm47XG5cbiAgLy8gdW5zZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWQgc2xpZGVcbiAgdGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKTtcbiAgLy8gdXBkYXRlIG5ldyBzZWxlY3RlZCBzbGlkZVxuICB0aGlzLnNlbGVjdGVkU2xpZGUgPSBzbGlkZTtcbiAgc2xpZGUuc2VsZWN0KCk7XG4gIHRoaXMuc2VsZWN0ZWRDZWxscyA9IHNsaWRlLmNlbGxzO1xuICB0aGlzLnNlbGVjdGVkRWxlbWVudHMgPSBzbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtcbiAgLy8gSEFDSzogc2VsZWN0ZWRDZWxsICYgc2VsZWN0ZWRFbGVtZW50IGlzIGZpcnN0IGNlbGwgaW4gc2xpZGUsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIHRoaXMuc2VsZWN0ZWRDZWxsID0gc2xpZGUuY2VsbHNbMF07XG4gIHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdO1xufTtcblxucHJvdG8udW5zZWxlY3RTZWxlY3RlZFNsaWRlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5zZWxlY3RlZFNsaWRlICkgdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCk7XG59O1xuXG5wcm90by5zZWxlY3RJbml0aWFsSW5kZXggPSBmdW5jdGlvbigpIHtcbiAgbGV0IGluaXRpYWxJbmRleCA9IHRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7XG4gIC8vIGFscmVhZHkgYWN0aXZhdGVkLCBzZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWRJbmRleFxuICBpZiAoIHRoaXMuaXNJbml0QWN0aXZhdGVkICkge1xuICAgIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXgsIGZhbHNlLCB0cnVlICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNlbGVjdCB3aXRoIHNlbGVjdG9yIHN0cmluZ1xuICBpZiAoIGluaXRpYWxJbmRleCAmJiB0eXBlb2YgaW5pdGlhbEluZGV4ID09ICdzdHJpbmcnICkge1xuICAgIGxldCBjZWxsID0gdGhpcy5xdWVyeUNlbGwoIGluaXRpYWxJbmRleCApO1xuICAgIGlmICggY2VsbCApIHtcbiAgICAgIHRoaXMuc2VsZWN0Q2VsbCggaW5pdGlhbEluZGV4LCBmYWxzZSwgdHJ1ZSApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGxldCBpbmRleCA9IDA7XG4gIC8vIHNlbGVjdCB3aXRoIG51bWJlclxuICBpZiAoIGluaXRpYWxJbmRleCAmJiB0aGlzLnNsaWRlc1sgaW5pdGlhbEluZGV4IF0gKSB7XG4gICAgaW5kZXggPSBpbml0aWFsSW5kZXg7XG4gIH1cbiAgLy8gc2VsZWN0IGluc3RhbnRseVxuICB0aGlzLnNlbGVjdCggaW5kZXgsIGZhbHNlLCB0cnVlICk7XG59O1xuXG4vKipcbiAqIHNlbGVjdCBzbGlkZSBmcm9tIG51bWJlciBvciBjZWxsIGVsZW1lbnRcbiAqIEBwYXJhbSB7W0VsZW1lbnQsIE51bWJlcl19IHZhbHVlIC0gemVyby1iYXNlZCBpbmRleCBvciBlbGVtZW50IHRvIHNlbGVjdFxuICogQHBhcmFtIHtCb29sZWFufSBpc1dyYXAgLSBlbmFibGVzIHdyYXBwaW5nIGFyb3VuZCBmb3IgZXh0cmEgaW5kZXhcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbnN0YW50IC0gZGlzYWJsZXMgc2xpZGUgYW5pbWF0aW9uXG4gKi9cbnByb3RvLnNlbGVjdENlbGwgPSBmdW5jdGlvbiggdmFsdWUsIGlzV3JhcCwgaXNJbnN0YW50ICkge1xuICAvLyBnZXQgY2VsbFxuICBsZXQgY2VsbCA9IHRoaXMucXVlcnlDZWxsKCB2YWx1ZSApO1xuICBpZiAoICFjZWxsICkgcmV0dXJuO1xuXG4gIGxldCBpbmRleCA9IHRoaXMuZ2V0Q2VsbFNsaWRlSW5kZXgoIGNlbGwgKTtcbiAgdGhpcy5zZWxlY3QoIGluZGV4LCBpc1dyYXAsIGlzSW5zdGFudCApO1xufTtcblxucHJvdG8uZ2V0Q2VsbFNsaWRlSW5kZXggPSBmdW5jdGlvbiggY2VsbCApIHtcbiAgLy8gZ2V0IGluZGV4IG9mIHNsaWRlIHRoYXQgaGFzIGNlbGxcbiAgbGV0IGNlbGxTbGlkZSA9IHRoaXMuc2xpZGVzLmZpbmQoICggc2xpZGUgKSA9PiBzbGlkZS5jZWxscy5pbmNsdWRlcyggY2VsbCApICk7XG4gIHJldHVybiB0aGlzLnNsaWRlcy5pbmRleE9mKCBjZWxsU2xpZGUgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldCBjZWxscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldCBGbGlja2l0eS5DZWxsLCBnaXZlbiBhbiBFbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW0gLSBtYXRjaGluZyBjZWxsIGVsZW1lbnRcbiAqIEByZXR1cm5zIHtGbGlja2l0eS5DZWxsfSBjZWxsIC0gbWF0Y2hpbmcgY2VsbFxuICovXG5wcm90by5nZXRDZWxsID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGxvb3AgdGhyb3VnaCBjZWxscyB0byBnZXQgdGhlIG9uZSB0aGF0IG1hdGNoZXNcbiAgZm9yICggbGV0IGNlbGwgb2YgdGhpcy5jZWxscyApIHtcbiAgICBpZiAoIGNlbGwuZWxlbWVudCA9PT0gZWxlbSApIHJldHVybiBjZWxsO1xuICB9XG59O1xuXG4vKipcbiAqIGdldCBjb2xsZWN0aW9uIG9mIEZsaWNraXR5LkNlbGxzLCBnaXZlbiBFbGVtZW50c1xuICogQHBhcmFtIHtbRWxlbWVudCwgQXJyYXksIE5vZGVMaXN0XX0gZWxlbXMgLSBtdWx0aXBsZSBlbGVtZW50c1xuICogQHJldHVybnMge0FycmF5fSBjZWxscyAtIEZsaWNraXR5LkNlbGxzXG4gKi9cbnByb3RvLmdldENlbGxzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgcmV0dXJuIGVsZW1zLm1hcCggKCBlbGVtICkgPT4gdGhpcy5nZXRDZWxsKCBlbGVtICkgKS5maWx0ZXIoIEJvb2xlYW4gKTtcbn07XG5cbi8qKlxuICogZ2V0IGNlbGwgZWxlbWVudHNcbiAqIEByZXR1cm5zIHtBcnJheX0gY2VsbEVsZW1zXG4gKi9cbnByb3RvLmdldENlbGxFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxscy5tYXAoICggY2VsbCApID0+IGNlbGwuZWxlbWVudCApO1xufTtcblxuLyoqXG4gKiBnZXQgcGFyZW50IGNlbGwgZnJvbSBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW0gLSBjaGlsZCBlbGVtZW50XG4gKiBAcmV0dXJucyB7RmxpY2tpdC5DZWxsfSBjZWxsIC0gcGFyZW50IGNlbGxcbiAqL1xucHJvdG8uZ2V0UGFyZW50Q2VsbCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAvLyBmaXJzdCBjaGVjayBpZiBlbGVtIGlzIGNlbGxcbiAgbGV0IGNlbGwgPSB0aGlzLmdldENlbGwoIGVsZW0gKTtcbiAgaWYgKCBjZWxsICkgcmV0dXJuIGNlbGw7XG5cbiAgLy8gdHJ5IHRvIGdldCBwYXJlbnQgY2VsbCBlbGVtXG4gIGxldCBjbG9zZXN0ID0gZWxlbS5jbG9zZXN0KCcuZmxpY2tpdHktc2xpZGVyID4gKicpO1xuICByZXR1cm4gdGhpcy5nZXRDZWxsKCBjbG9zZXN0ICk7XG59O1xuXG4vKipcbiAqIGdldCBjZWxscyBhZGphY2VudCB0byBhIHNsaWRlXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGFkakNvdW50IC0gbnVtYmVyIG9mIGFkamFjZW50IHNsaWRlc1xuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIGluZGV4IG9mIHNsaWRlIHRvIHN0YXJ0XG4gKiBAcmV0dXJucyB7QXJyYXl9IGNlbGxzIC0gYXJyYXkgb2YgRmxpY2tpdHkuQ2VsbHNcbiAqL1xucHJvdG8uZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbiggYWRqQ291bnQsIGluZGV4ICkge1xuICBpZiAoICFhZGpDb3VudCApIHJldHVybiB0aGlzLnNlbGVjdGVkU2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCk7XG5cbiAgaW5kZXggPSBpbmRleCA9PT0gdW5kZWZpbmVkID8gdGhpcy5zZWxlY3RlZEluZGV4IDogaW5kZXg7XG5cbiAgbGV0IGxlbiA9IHRoaXMuc2xpZGVzLmxlbmd0aDtcbiAgaWYgKCAxICsgKCBhZGpDb3VudCAqIDIgKSA+PSBsZW4gKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2VsbEVsZW1lbnRzKCk7IC8vIGdldCBhbGxcbiAgfVxuXG4gIGxldCBjZWxsRWxlbXMgPSBbXTtcbiAgZm9yICggbGV0IGkgPSBpbmRleCAtIGFkakNvdW50OyBpIDw9IGluZGV4ICsgYWRqQ291bnQ7IGkrKyApIHtcbiAgICBsZXQgc2xpZGVJbmRleCA9IHRoaXMuaXNXcmFwcGluZyA/IHV0aWxzLm1vZHVsbyggaSwgbGVuICkgOiBpO1xuICAgIGxldCBzbGlkZSA9IHRoaXMuc2xpZGVzWyBzbGlkZUluZGV4IF07XG4gICAgaWYgKCBzbGlkZSApIHtcbiAgICAgIGNlbGxFbGVtcyA9IGNlbGxFbGVtcy5jb25jYXQoIHNsaWRlLmdldENlbGxFbGVtZW50cygpICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjZWxsRWxlbXM7XG59O1xuXG4vKipcbiAqIHNlbGVjdCBzbGlkZSBmcm9tIG51bWJlciBvciBjZWxsIGVsZW1lbnRcbiAqIEBwYXJhbSB7W0VsZW1lbnQsIFN0cmluZywgTnVtYmVyXX0gc2VsZWN0b3IgLSBlbGVtZW50LCBzZWxlY3RvciBzdHJpbmcsIG9yIGluZGV4XG4gKiBAcmV0dXJucyB7RmxpY2tpdHkuQ2VsbH0gLSBtYXRjaGluZyBjZWxsXG4gKi9cbnByb3RvLnF1ZXJ5Q2VsbCA9IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT0gJ251bWJlcicgKSB7XG4gICAgLy8gdXNlIG51bWJlciBhcyBpbmRleFxuICAgIHJldHVybiB0aGlzLmNlbGxzWyBzZWxlY3RvciBdO1xuICB9XG4gIC8vIGRvIG5vdCBzZWxlY3QgaW52YWxpZCBzZWxlY3RvcnMgZnJvbSBoYXNoOiAjMTIzLCAjLy4gIzc5MVxuICBsZXQgaXNTZWxlY3RvclN0cmluZyA9IHR5cGVvZiBzZWxlY3RvciA9PSAnc3RyaW5nJyAmJiAhc2VsZWN0b3IubWF0Y2goIC9eWyMuXT9bXFxkL10vICk7XG4gIGlmICggaXNTZWxlY3RvclN0cmluZyApIHtcbiAgICAvLyB1c2Ugc3RyaW5nIGFzIHNlbGVjdG9yLCBnZXQgZWxlbWVudFxuICAgIHNlbGVjdG9yID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoIHNlbGVjdG9yICk7XG4gIH1cbiAgLy8gZ2V0IGNlbGwgZnJvbSBlbGVtZW50XG4gIHJldHVybiB0aGlzLmdldENlbGwoIHNlbGVjdG9yICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBldmVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udWlDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbWl0RXZlbnQoJ3VpQ2hhbmdlJyk7XG59O1xuXG4vLyAtLS0tLSByZXNpemUgLS0tLS0gLy9cblxucHJvdG8ub25yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy53YXRjaENTUygpO1xuICB0aGlzLnJlc2l6ZSgpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEZsaWNraXR5LCAnb25yZXNpemUnLCAxNTAgKTtcblxucHJvdG8ucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIC8vICMxMTc3IGRpc2FibGUgcmVzaXplIGJlaGF2aW9yIHdoZW4gYW5pbWF0aW5nIG9yIGRyYWdnaW5nIGZvciBpT1MgMTVcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSB8fCB0aGlzLmlzQW5pbWF0aW5nIHx8IHRoaXMuaXNEcmFnZ2luZyApIHJldHVybjtcbiAgdGhpcy5nZXRTaXplKCk7XG4gIC8vIHdyYXAgdmFsdWVzXG4gIGlmICggdGhpcy5pc1dyYXBwaW5nICkge1xuICAgIHRoaXMueCA9IHV0aWxzLm1vZHVsbyggdGhpcy54LCB0aGlzLnNsaWRlYWJsZVdpZHRoICk7XG4gIH1cbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMuX3VwZGF0ZVdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbiAgdGhpcy5lbWl0RXZlbnQoJ3Jlc2l6ZScpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWQgaW5kZXggZm9yIGdyb3VwIHNsaWRlcywgaW5zdGFudFxuICAvLyBUT0RPOiBwb3NpdGlvbiBjYW4gYmUgbG9zdCBiZXR3ZWVuIGdyb3VwcyBvZiB2YXJpb3VzIG51bWJlcnNcbiAgbGV0IHNlbGVjdGVkRWxlbWVudCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50cyAmJiB0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07XG4gIHRoaXMuc2VsZWN0Q2VsbCggc2VsZWN0ZWRFbGVtZW50LCBmYWxzZSwgdHJ1ZSApO1xufTtcblxuLy8gd2F0Y2hlcyB0aGUgOmFmdGVyIHByb3BlcnR5LCBhY3RpdmF0ZXMvZGVhY3RpdmF0ZXNcbnByb3RvLndhdGNoQ1NTID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy53YXRjaENTUyApIHJldHVybjtcblxuICBsZXQgYWZ0ZXJDb250ZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZSggdGhpcy5lbGVtZW50LCAnOmFmdGVyJyApLmNvbnRlbnQ7XG4gIC8vIGFjdGl2YXRlIGlmIDphZnRlciB7IGNvbnRlbnQ6ICdmbGlja2l0eScgfVxuICBpZiAoIGFmdGVyQ29udGVudC5pbmNsdWRlcygnZmxpY2tpdHknKSApIHtcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGtleWRvd24gLS0tLS0gLy9cblxuLy8gZ28gcHJldmlvdXMvbmV4dCBpZiBsZWZ0L3JpZ2h0IGtleXMgcHJlc3NlZFxucHJvdG8ub25rZXlkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBsZXQgeyBhY3RpdmVFbGVtZW50IH0gPSBkb2N1bWVudDtcbiAgbGV0IGhhbmRsZXIgPSBGbGlja2l0eS5rZXlib2FyZEhhbmRsZXJzWyBldmVudC5rZXkgXTtcbiAgLy8gb25seSB3b3JrIGlmIGVsZW1lbnQgaXMgaW4gZm9jdXNcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgfHwgIWFjdGl2ZUVsZW1lbnQgfHwgIWhhbmRsZXIgKSByZXR1cm47XG5cbiAgbGV0IGlzRm9jdXNlZCA9IHRoaXMuZm9jdXNhYmxlRWxlbXMuc29tZSggKCBlbGVtICkgPT4gYWN0aXZlRWxlbWVudCA9PT0gZWxlbSApO1xuICBpZiAoIGlzRm9jdXNlZCApIGhhbmRsZXIuY2FsbCggdGhpcyApO1xufTtcblxuRmxpY2tpdHkua2V5Ym9hcmRIYW5kbGVycyA9IHtcbiAgQXJyb3dMZWZ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnVpQ2hhbmdlKCk7XG4gICAgbGV0IGxlZnRNZXRob2QgPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAnbmV4dCcgOiAncHJldmlvdXMnO1xuICAgIHRoaXNbIGxlZnRNZXRob2QgXSgpO1xuICB9LFxuICBBcnJvd1JpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnVpQ2hhbmdlKCk7XG4gICAgbGV0IHJpZ2h0TWV0aG9kID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gJ3ByZXZpb3VzJyA6ICduZXh0JztcbiAgICB0aGlzWyByaWdodE1ldGhvZCBdKCk7XG4gIH0sXG59O1xuXG4vLyAtLS0tLSBmb2N1cyAtLS0tLSAvL1xuXG5wcm90by5mb2N1cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZGVzdHJveSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkZWFjdGl2YXRlIGFsbCBGbGlja2l0eSBmdW5jdGlvbmFsaXR5LCBidXQga2VlcCBzdHVmZiBhdmFpbGFibGVcbnByb3RvLmRlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHJldHVybjtcblxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZmxpY2tpdHktZW5hYmxlZCcpO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZmxpY2tpdHktcnRsJyk7XG4gIHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCk7XG4gIC8vIGRlc3Ryb3kgY2VsbHNcbiAgdGhpcy5jZWxscy5mb3JFYWNoKCAoIGNlbGwgKSA9PiBjZWxsLmRlc3Ryb3koKSApO1xuICB0aGlzLnZpZXdwb3J0LnJlbW92ZSgpO1xuICAvLyBtb3ZlIGNoaWxkIGVsZW1lbnRzIGJhY2sgaW50byBlbGVtZW50XG4gIHRoaXMuZWxlbWVudC5hcHBlbmQoIC4uLnRoaXMuc2xpZGVyLmNoaWxkcmVuICk7XG4gIGlmICggdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiSW5kZXgnKTtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzICk7XG4gIH1cbiAgLy8gc2V0IGZsYWdzXG4gIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0RXZlbnQoJ2RlYWN0aXZhdGUnKTtcbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcyApO1xuICB0aGlzLmFsbE9mZigpO1xuICB0aGlzLmVtaXRFdmVudCgnZGVzdHJveScpO1xuICBpZiAoIGpRdWVyeSAmJiB0aGlzLiRlbGVtZW50ICkge1xuICAgIGpRdWVyeS5yZW1vdmVEYXRhKCB0aGlzLmVsZW1lbnQsICdmbGlja2l0eScgKTtcbiAgfVxuICBkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRDtcbiAgZGVsZXRlIGluc3RhbmNlc1sgdGhpcy5ndWlkIF07XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuT2JqZWN0LmFzc2lnbiggcHJvdG8sIGFuaW1hdGVQcm90b3R5cGUgKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZXh0cmFzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogZ2V0IEZsaWNraXR5IGluc3RhbmNlIGZyb20gZWxlbWVudFxuICogQHBhcmFtIHtbRWxlbWVudCwgU3RyaW5nXX0gZWxlbSAtIGVsZW1lbnQgb3Igc2VsZWN0b3Igc3RyaW5nXG4gKiBAcmV0dXJucyB7RmxpY2tpdHl9IC0gRmxpY2tpdHkgaW5zdGFuY2VcbiAqL1xuRmxpY2tpdHkuZGF0YSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBlbGVtID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCBlbGVtICk7XG4gIGlmICggZWxlbSApIHJldHVybiBpbnN0YW5jZXNbIGVsZW0uZmxpY2tpdHlHVUlEIF07XG59O1xuXG51dGlscy5odG1sSW5pdCggRmxpY2tpdHksICdmbGlja2l0eScgKTtcblxubGV0IHsgalF1ZXJ5QnJpZGdldCB9ID0gd2luZG93O1xuaWYgKCBqUXVlcnkgJiYgalF1ZXJ5QnJpZGdldCApIHtcbiAgalF1ZXJ5QnJpZGdldCggJ2ZsaWNraXR5JywgRmxpY2tpdHksIGpRdWVyeSApO1xufVxuXG4vLyBzZXQgaW50ZXJuYWwgalF1ZXJ5LCBmb3IgV2VicGFjayArIGpRdWVyeSB2MywgIzQ3OFxuRmxpY2tpdHkuc2V0SlF1ZXJ5ID0gZnVuY3Rpb24oIGpxICkge1xuICBqUXVlcnkgPSBqcTtcbn07XG5cbkZsaWNraXR5LkNlbGwgPSBDZWxsO1xuRmxpY2tpdHkuU2xpZGUgPSBTbGlkZTtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59ICkgKTtcbiIsIi8vIGRyYWdcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgndW5pZHJhZ2dlcicpLFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgICAgd2luZG93LlVuaWRyYWdnZXIsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyxcbiAgICBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlkcmFnZ2VyLCB1dGlscyApIHtcblxuLy8gLS0tLS0gZGVmYXVsdHMgLS0tLS0gLy9cblxuT2JqZWN0LmFzc2lnbiggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgZHJhZ2dhYmxlOiAnPjEnLFxuICBkcmFnVGhyZXNob2xkOiAzLFxufSApO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnIHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5sZXQgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5PYmplY3QuYXNzaWduKCBwcm90bywgVW5pZHJhZ2dlci5wcm90b3R5cGUgKTsgLy8gaW5oZXJpdCBVbmlkcmFnZ2VyXG5wcm90by50b3VjaEFjdGlvblZhbHVlID0gJyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5GbGlja2l0eS5jcmVhdGUuZHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLm9uQWN0aXZhdGVEcmFnICk7XG4gIHRoaXMub24oICd1aUNoYW5nZScsIHRoaXMuX3VpQ2hhbmdlRHJhZyApO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMub25EZWFjdGl2YXRlRHJhZyApO1xuICB0aGlzLm9uKCAnY2VsbENoYW5nZScsIHRoaXMudXBkYXRlRHJhZ2dhYmxlICk7XG4gIHRoaXMub24oICdwb2ludGVyRG93bicsIHRoaXMuaGFuZGxlUG9pbnRlckRvd24gKTtcbiAgdGhpcy5vbiggJ3BvaW50ZXJVcCcsIHRoaXMuaGFuZGxlUG9pbnRlclVwICk7XG4gIHRoaXMub24oICdwb2ludGVyRG93bicsIHRoaXMuaGFuZGxlUG9pbnRlckRvbmUgKTtcbiAgdGhpcy5vbiggJ2RyYWdTdGFydCcsIHRoaXMuaGFuZGxlRHJhZ1N0YXJ0ICk7XG4gIHRoaXMub24oICdkcmFnTW92ZScsIHRoaXMuaGFuZGxlRHJhZ01vdmUgKTtcbiAgdGhpcy5vbiggJ2RyYWdFbmQnLCB0aGlzLmhhbmRsZURyYWdFbmQgKTtcbiAgdGhpcy5vbiggJ3N0YXRpY0NsaWNrJywgdGhpcy5oYW5kbGVTdGF0aWNDbGljayApO1xuICAvLyBUT0RPIHVwZGF0ZURyYWdnYWJsZSBvbiByZXNpemU/IGlmIGdyb3VwQ2VsbHMgJiBzbGlkZXMgY2hhbmdlXG59O1xuXG5wcm90by5vbkFjdGl2YXRlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhhbmRsZXMgPSBbIHRoaXMudmlld3BvcnQgXTtcbiAgdGhpcy5iaW5kSGFuZGxlcygpO1xuICB0aGlzLnVwZGF0ZURyYWdnYWJsZSgpO1xufTtcblxucHJvdG8ub25EZWFjdGl2YXRlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVuYmluZEhhbmRsZXMoKTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWRyYWdnYWJsZScpO1xufTtcblxucHJvdG8udXBkYXRlRHJhZ2dhYmxlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRpc2FibGUgZHJhZ2dpbmcgaWYgbGVzcyB0aGFuIDIgc2xpZGVzLiAjMjc4XG4gIGlmICggdGhpcy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gJz4xJyApIHtcbiAgICB0aGlzLmlzRHJhZ2dhYmxlID0gdGhpcy5zbGlkZXMubGVuZ3RoID4gMTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmlzRHJhZ2dhYmxlID0gdGhpcy5vcHRpb25zLmRyYWdnYWJsZTtcbiAgfVxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2lzLWRyYWdnYWJsZScsIHRoaXMuaXNEcmFnZ2FibGUgKTtcbn07XG5cbnByb3RvLl91aUNoYW5nZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcG9pbnRlciBldmVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uaGFuZGxlUG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgKSB7XG4gICAgLy8gcHJvY2VlZCBmb3Igc3RhdGljQ2xpY2tcbiAgICB0aGlzLmJpbmRBY3RpdmVQb2ludGVyRXZlbnRzKCBldmVudCApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGxldCBpc1RvdWNoU3RhcnQgPSBldmVudC50eXBlID09PSAndG91Y2hzdGFydCc7XG4gIGxldCBpc1RvdWNoUG9pbnRlciA9IGV2ZW50LnBvaW50ZXJUeXBlID09PSAndG91Y2gnO1xuICBsZXQgaXNGb2N1c05vZGUgPSBldmVudC50YXJnZXQubWF0Y2hlcygnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QnKTtcbiAgaWYgKCAhaXNUb3VjaFN0YXJ0ICYmICFpc1RvdWNoUG9pbnRlciAmJiAhaXNGb2N1c05vZGUgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBpZiAoICFpc0ZvY3VzTm9kZSApIHRoaXMuZm9jdXMoKTtcbiAgLy8gYmx1clxuICBpZiAoIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuZWxlbWVudCApIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuICAvLyBzdG9wIGlmIGl0IHdhcyBtb3ZpbmdcbiAgdGhpcy5kcmFnWCA9IHRoaXMueDtcbiAgdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVyLWRvd24nKTtcbiAgLy8gdHJhY2sgc2Nyb2xsaW5nXG4gIHRoaXMucG9pbnRlckRvd25TY3JvbGwgPSBnZXRTY3JvbGxQb3NpdGlvbigpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMgKTtcbiAgdGhpcy5iaW5kQWN0aXZlUG9pbnRlckV2ZW50cyggZXZlbnQgKTtcbn07XG5cbi8vIC0tLS0tIG1vdmUgLS0tLS0gLy9cblxucHJvdG8uaGFzRHJhZ1N0YXJ0ZWQgPSBmdW5jdGlvbiggbW92ZVZlY3RvciApIHtcbiAgcmV0dXJuIE1hdGguYWJzKCBtb3ZlVmVjdG9yLnggKSA+IHRoaXMub3B0aW9ucy5kcmFnVGhyZXNob2xkO1xufTtcblxuLy8gLS0tLS0gdXAgLS0tLS0gLy9cblxucHJvdG8uaGFuZGxlUG9pbnRlclVwID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLmlzVG91Y2hTY3JvbGxpbmc7XG4gIHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlci1kb3duJyk7XG59O1xuXG5wcm90by5oYW5kbGVQb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMgKTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlckRvd25TY3JvbGw7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnZ2luZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by5oYW5kbGVEcmFnU3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHJldHVybjtcblxuICB0aGlzLmRyYWdTdGFydFBvc2l0aW9uID0gdGhpcy54O1xuICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnc2Nyb2xsJywgdGhpcyApO1xufTtcblxucHJvdG8uaGFuZGxlRHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgKSByZXR1cm47XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB0aGlzLnByZXZpb3VzRHJhZ1ggPSB0aGlzLmRyYWdYO1xuICAvLyByZXZlcnNlIGlmIHJpZ2h0LXRvLWxlZnRcbiAgbGV0IGRpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/IC0xIDogMTtcbiAgLy8gd3JhcCBhcm91bmQgbW92ZS4gIzU4OVxuICBpZiAoIHRoaXMuaXNXcmFwcGluZyApIG1vdmVWZWN0b3IueCAlPSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICBsZXQgZHJhZ1ggPSB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICsgbW92ZVZlY3Rvci54ICogZGlyZWN0aW9uO1xuXG4gIGlmICggIXRoaXMuaXNXcmFwcGluZyApIHtcbiAgICAvLyBzbG93IGRyYWdcbiAgICBsZXQgb3JpZ2luQm91bmQgPSBNYXRoLm1heCggLXRoaXMuc2xpZGVzWzBdLnRhcmdldCwgdGhpcy5kcmFnU3RhcnRQb3NpdGlvbiApO1xuICAgIGRyYWdYID0gZHJhZ1ggPiBvcmlnaW5Cb3VuZCA/ICggZHJhZ1ggKyBvcmlnaW5Cb3VuZCApICogMC41IDogZHJhZ1g7XG4gICAgbGV0IGVuZEJvdW5kID0gTWF0aC5taW4oIC10aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCwgdGhpcy5kcmFnU3RhcnRQb3NpdGlvbiApO1xuICAgIGRyYWdYID0gZHJhZ1ggPCBlbmRCb3VuZCA/ICggZHJhZ1ggKyBlbmRCb3VuZCApICogMC41IDogZHJhZ1g7XG4gIH1cblxuICB0aGlzLmRyYWdYID0gZHJhZ1g7XG4gIHRoaXMuZHJhZ01vdmVUaW1lID0gbmV3IERhdGUoKTtcbn07XG5cbnByb3RvLmhhbmRsZURyYWdFbmQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHJldHVybjtcblxuICBsZXQgeyBmcmVlU2Nyb2xsIH0gPSB0aGlzLm9wdGlvbnM7XG4gIGlmICggZnJlZVNjcm9sbCApIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgLy8gc2V0IHNlbGVjdGVkSW5kZXggYmFzZWQgb24gd2hlcmUgZmxpY2sgd2lsbCBlbmQgdXBcbiAgbGV0IGluZGV4ID0gdGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO1xuXG4gIGlmICggZnJlZVNjcm9sbCAmJiAhdGhpcy5pc1dyYXBwaW5nICkge1xuICAgIC8vIGlmIGZyZWUtc2Nyb2xsICYgbm90IHdyYXAgYXJvdW5kXG4gICAgLy8gZG8gbm90IGZyZWUtc2Nyb2xsIGlmIGdvaW5nIG91dHNpZGUgb2YgYm91bmRpbmcgc2xpZGVzXG4gICAgLy8gc28gYm91bmRpbmcgc2xpZGVzIGNhbiBhdHRyYWN0IHNsaWRlciwgYW5kIGtlZXAgaXQgaW4gYm91bmRzXG4gICAgbGV0IHJlc3RpbmdYID0gdGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTtcbiAgICB0aGlzLmlzRnJlZVNjcm9sbGluZyA9IC1yZXN0aW5nWCA+IHRoaXMuc2xpZGVzWzBdLnRhcmdldCAmJlxuICAgICAgLXJlc3RpbmdYIDwgdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQ7XG4gIH0gZWxzZSBpZiAoICFmcmVlU2Nyb2xsICYmIGluZGV4ID09PSB0aGlzLnNlbGVjdGVkSW5kZXggKSB7XG4gICAgLy8gYm9vc3Qgc2VsZWN0aW9uIGlmIHNlbGVjdGVkIGluZGV4IGhhcyBub3QgY2hhbmdlZFxuICAgIGluZGV4ICs9IHRoaXMuZHJhZ0VuZEJvb3N0U2VsZWN0KCk7XG4gIH1cbiAgZGVsZXRlIHRoaXMucHJldmlvdXNEcmFnWDtcbiAgLy8gYXBwbHkgc2VsZWN0aW9uXG4gIC8vIEhBQ0ssIHNldCBmbGFnIHNvIGRyYWdnaW5nIHN0YXlzIGluIGNvcnJlY3QgZGlyZWN0aW9uXG4gIHRoaXMuaXNEcmFnU2VsZWN0ID0gdGhpcy5pc1dyYXBwaW5nO1xuICB0aGlzLnNlbGVjdCggaW5kZXggKTtcbiAgZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0O1xufTtcblxucHJvdG8uZHJhZ0VuZFJlc3RpbmdTZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHJlc3RpbmdYID0gdGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTtcbiAgLy8gaG93IGZhciBhd2F5IGZyb20gc2VsZWN0ZWQgc2xpZGVcbiAgbGV0IGRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXJlc3RpbmdYLCB0aGlzLnNlbGVjdGVkSW5kZXggKSApO1xuICAvLyBnZXQgY2xvc2V0IHJlc3RpbmcgZ29pbmcgdXAgYW5kIGdvaW5nIGRvd25cbiAgbGV0IHBvc2l0aXZlUmVzdGluZyA9IHRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKCByZXN0aW5nWCwgZGlzdGFuY2UsIDEgKTtcbiAgbGV0IG5lZ2F0aXZlUmVzdGluZyA9IHRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKCByZXN0aW5nWCwgZGlzdGFuY2UsIC0xICk7XG4gIC8vIHVzZSBjbG9zZXIgcmVzdGluZyBmb3Igd3JhcC1hcm91bmRcbiAgcmV0dXJuIHBvc2l0aXZlUmVzdGluZy5kaXN0YW5jZSA8IG5lZ2F0aXZlUmVzdGluZy5kaXN0YW5jZSA/XG4gICAgcG9zaXRpdmVSZXN0aW5nLmluZGV4IDogbmVnYXRpdmVSZXN0aW5nLmluZGV4O1xufTtcblxuLyoqXG4gKiBnaXZlbiByZXN0aW5nIFggYW5kIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIGdldCB0aGUgZGlzdGFuY2UgYW5kIGluZGV4IG9mIHRoZSBjbG9zZXN0IGNlbGxcbiAqIEBwYXJhbSB7TnVtYmVyfSByZXN0aW5nWCAtIGVzdGltYXRlZCBwb3N0LWZsaWNrIHJlc3RpbmcgcG9zaXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXN0YW5jZSAtIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5jcmVtZW50IC0gKzEgb3IgLTEsIGdvaW5nIHVwIG9yIGRvd25cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0geyBkaXN0YW5jZToge051bWJlcn0sIGluZGV4OiB7SW50ZWdlcn0gfVxuICovXG5wcm90by5fZ2V0Q2xvc2VzdFJlc3RpbmcgPSBmdW5jdGlvbiggcmVzdGluZ1gsIGRpc3RhbmNlLCBpbmNyZW1lbnQgKSB7XG4gIGxldCBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgbGV0IG1pbkRpc3RhbmNlID0gSW5maW5pdHk7XG4gIGxldCBjb25kaXRpb24gPSB0aGlzLm9wdGlvbnMuY29udGFpbiAmJiAhdGhpcy5pc1dyYXBwaW5nID9cbiAgICAvLyBpZiBjb250YWluaW5nLCBrZWVwIGdvaW5nIGlmIGRpc3RhbmNlIGlzIGVxdWFsIHRvIG1pbkRpc3RhbmNlXG4gICAgKCBkaXN0LCBtaW5EaXN0ICkgPT4gZGlzdCA8PSBtaW5EaXN0IDpcbiAgICAoIGRpc3QsIG1pbkRpc3QgKSA9PiBkaXN0IDwgbWluRGlzdDtcblxuICB3aGlsZSAoIGNvbmRpdGlvbiggZGlzdGFuY2UsIG1pbkRpc3RhbmNlICkgKSB7XG4gICAgLy8gbWVhc3VyZSBkaXN0YW5jZSB0byBuZXh0IGNlbGxcbiAgICBpbmRleCArPSBpbmNyZW1lbnQ7XG4gICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICBkaXN0YW5jZSA9IHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXJlc3RpbmdYLCBpbmRleCApO1xuICAgIGlmICggZGlzdGFuY2UgPT09IG51bGwgKSBicmVhaztcblxuICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoIGRpc3RhbmNlICk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkaXN0YW5jZTogbWluRGlzdGFuY2UsXG4gICAgLy8gc2VsZWN0ZWQgd2FzIHByZXZpb3VzIGluZGV4XG4gICAgaW5kZXg6IGluZGV4IC0gaW5jcmVtZW50LFxuICB9O1xufTtcblxuLyoqXG4gKiBtZWFzdXJlIGRpc3RhbmNlIGJldHdlZW4geCBhbmQgYSBzbGlkZSB0YXJnZXRcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IC0gaG9yaXpvbnRhbCBwb3NpdGlvblxuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIHNsaWRlIGluZGV4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSAtIHNsaWRlIGRpc3RhbmNlXG4gKi9cbnByb3RvLmdldFNsaWRlRGlzdGFuY2UgPSBmdW5jdGlvbiggeCwgaW5kZXggKSB7XG4gIGxldCBsZW4gPSB0aGlzLnNsaWRlcy5sZW5ndGg7XG4gIC8vIHdyYXAgYXJvdW5kIGlmIGF0IGxlYXN0IDIgc2xpZGVzXG4gIGxldCBpc1dyYXBBcm91bmQgPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiBsZW4gPiAxO1xuICBsZXQgc2xpZGVJbmRleCA9IGlzV3JhcEFyb3VuZCA/IHV0aWxzLm1vZHVsbyggaW5kZXgsIGxlbiApIDogaW5kZXg7XG4gIGxldCBzbGlkZSA9IHRoaXMuc2xpZGVzWyBzbGlkZUluZGV4IF07XG4gIGlmICggIXNsaWRlICkgcmV0dXJuIG51bGw7XG5cbiAgLy8gYWRkIGRpc3RhbmNlIGZvciB3cmFwLWFyb3VuZCBzbGlkZXNcbiAgbGV0IHdyYXAgPSBpc1dyYXBBcm91bmQgPyB0aGlzLnNsaWRlYWJsZVdpZHRoICogTWF0aC5mbG9vciggaW5kZXgvbGVuICkgOiAwO1xuICByZXR1cm4geCAtICggc2xpZGUudGFyZ2V0ICsgd3JhcCApO1xufTtcblxucHJvdG8uZHJhZ0VuZEJvb3N0U2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRvIG5vdCBib29zdCBpZiBubyBwcmV2aW91c0RyYWdYIG9yIGRyYWdNb3ZlVGltZVxuICBpZiAoIHRoaXMucHJldmlvdXNEcmFnWCA9PT0gdW5kZWZpbmVkIHx8ICF0aGlzLmRyYWdNb3ZlVGltZSB8fFxuICAgIC8vIG9yIGlmIGRyYWcgd2FzIGhlbGQgZm9yIDEwMCBtc1xuICAgIG5ldyBEYXRlKCkgLSB0aGlzLmRyYWdNb3ZlVGltZSA+IDEwMCApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGxldCBkaXN0YW5jZSA9IHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXRoaXMuZHJhZ1gsIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICBsZXQgZGVsdGEgPSB0aGlzLnByZXZpb3VzRHJhZ1ggLSB0aGlzLmRyYWdYO1xuICBpZiAoIGRpc3RhbmNlID4gMCAmJiBkZWx0YSA+IDAgKSB7XG4gICAgLy8gYm9vc3QgdG8gbmV4dCBpZiBtb3ZpbmcgdG93YXJkcyB0aGUgcmlnaHQsIGFuZCBwb3NpdGl2ZSB2ZWxvY2l0eVxuICAgIHJldHVybiAxO1xuICB9IGVsc2UgaWYgKCBkaXN0YW5jZSA8IDAgJiYgZGVsdGEgPCAwICkge1xuICAgIC8vIGJvb3N0IHRvIHByZXZpb3VzIGlmIG1vdmluZyB0b3dhcmRzIHRoZSBsZWZ0LCBhbmQgbmVnYXRpdmUgdmVsb2NpdHlcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG4vLyAtLS0tLSBzY3JvbGwgLS0tLS0gLy9cblxucHJvdG8ub25zY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHNjcm9sbCA9IGdldFNjcm9sbFBvc2l0aW9uKCk7XG4gIGxldCBzY3JvbGxNb3ZlWCA9IHRoaXMucG9pbnRlckRvd25TY3JvbGwueCAtIHNjcm9sbC54O1xuICBsZXQgc2Nyb2xsTW92ZVkgPSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnkgLSBzY3JvbGwueTtcbiAgLy8gY2FuY2VsIGNsaWNrL3RhcCBpZiBzY3JvbGwgaXMgdG9vIG11Y2hcbiAgaWYgKCBNYXRoLmFicyggc2Nyb2xsTW92ZVggKSA+IDMgfHwgTWF0aC5hYnMoIHNjcm9sbE1vdmVZICkgPiAzICkge1xuICAgIHRoaXMucG9pbnRlckRvbmUoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsUG9zaXRpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogd2luZG93LnBhZ2VYT2Zmc2V0LFxuICAgIHk6IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgfTtcbn1cblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBpbWFnZXNsb2FkZWRcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2ltYWdlc2xvYWRlZCcpLFxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICAgIHdpbmRvdy5pbWFnZXNMb2FkZWQsXG4gICAgKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyxcbiAgICBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgaW1hZ2VzTG9hZGVkICkge1xuXG5GbGlja2l0eS5jcmVhdGUuaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuaW1hZ2VzTG9hZGVkICk7XG59O1xuXG5GbGlja2l0eS5wcm90b3R5cGUuaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5pbWFnZXNMb2FkZWQgKSByZXR1cm47XG5cbiAgbGV0IG9uSW1hZ2VzTG9hZGVkUHJvZ3Jlc3MgPSAoIGluc3RhbmNlLCBpbWFnZSApID0+IHtcbiAgICBsZXQgY2VsbCA9IHRoaXMuZ2V0UGFyZW50Q2VsbCggaW1hZ2UuaW1nICk7XG4gICAgdGhpcy5jZWxsU2l6ZUNoYW5nZSggY2VsbCAmJiBjZWxsLmVsZW1lbnQgKTtcbiAgICBpZiAoICF0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCApIHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk7XG4gIH07XG4gIGltYWdlc0xvYWRlZCggdGhpcy5zbGlkZXIgKS5vbiggJ3Byb2dyZXNzJywgb25JbWFnZXNMb2FkZWRQcm9ncmVzcyApO1xufTtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59ICkgKTtcbiIsIi8qIVxuICogRmxpY2tpdHkgdjMuMC4wXG4gKiBUb3VjaCwgcmVzcG9uc2l2ZSwgZmxpY2thYmxlIGNhcm91c2Vsc1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEZsaWNraXR5IENvbW1lcmNpYWwgTGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2VcbiAqXG4gKiBodHRwczovL2ZsaWNraXR5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTUtMjAyMiBNZXRhZml6enlcbiAqL1xuXG5pZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gIGNvbnN0IEZsaWNraXR5ID0gcmVxdWlyZSgnLi9jb3JlJyk7XG4gIHJlcXVpcmUoJy4vZHJhZycpO1xuICByZXF1aXJlKCcuL3ByZXYtbmV4dC1idXR0b24nKTtcbiAgcmVxdWlyZSgnLi9wYWdlLWRvdHMnKTtcbiAgcmVxdWlyZSgnLi9wbGF5ZXInKTtcbiAgcmVxdWlyZSgnLi9hZGQtcmVtb3ZlLWNlbGwnKTtcbiAgcmVxdWlyZSgnLi9sYXp5bG9hZCcpO1xuICByZXF1aXJlKCcuL2ltYWdlc2xvYWRlZCcpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gRmxpY2tpdHk7XG59XG4iLCIvLyBsYXp5bG9hZFxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICByZXF1aXJlKCcuL2NvcmUnKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5LCB1dGlscyApIHtcblxuY29uc3QgbGF6eUF0dHIgPSAnZGF0YS1mbGlja2l0eS1sYXp5bG9hZCc7XG5jb25zdCBsYXp5U3JjQXR0ciA9IGAke2xhenlBdHRyfS1zcmNgO1xuY29uc3QgbGF6eVNyY3NldEF0dHIgPSBgJHtsYXp5QXR0cn0tc3Jjc2V0YDtcbmNvbnN0IGltZ1NlbGVjdG9yID0gYGltZ1ske2xhenlBdHRyfV0sIGltZ1ske2xhenlTcmNBdHRyfV0sIGAgK1xuICBgaW1nWyR7bGF6eVNyY3NldEF0dHJ9XSwgc291cmNlWyR7bGF6eVNyY3NldEF0dHJ9XWA7XG5cbkZsaWNraXR5LmNyZWF0ZS5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5sYXp5TG9hZCApO1xuXG4gIHRoaXMuaGFuZGxlTGF6eUxvYWRDb21wbGV0ZSA9IHRoaXMub25MYXp5TG9hZENvbXBsZXRlLmJpbmQoIHRoaXMgKTtcbn07XG5cbmxldCBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8ubGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgbGV0IHsgbGF6eUxvYWQgfSA9IHRoaXMub3B0aW9ucztcbiAgaWYgKCAhbGF6eUxvYWQgKSByZXR1cm47XG5cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICBsZXQgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIC8vIGxhenkgbG9hZCBpbWFnZXNcbiAgdGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyggYWRqQ291bnQgKVxuICAgIC5tYXAoIGdldENlbGxMYXp5SW1hZ2VzIClcbiAgICAuZmxhdCgpXG4gICAgLmZvckVhY2goICggaW1nICkgPT4gbmV3IExhenlMb2FkZXIoIGltZywgdGhpcy5oYW5kbGVMYXp5TG9hZENvbXBsZXRlICkgKTtcbn07XG5cbmZ1bmN0aW9uIGdldENlbGxMYXp5SW1hZ2VzKCBjZWxsRWxlbSApIHtcbiAgLy8gY2hlY2sgaWYgY2VsbCBlbGVtZW50IGlzIGxhenkgaW1hZ2VcbiAgaWYgKCBjZWxsRWxlbS5tYXRjaGVzKCdpbWcnKSApIHtcbiAgICBsZXQgY2VsbEF0dHIgPSBjZWxsRWxlbS5nZXRBdHRyaWJ1dGUoIGxhenlBdHRyICk7XG4gICAgbGV0IGNlbGxTcmNBdHRyID0gY2VsbEVsZW0uZ2V0QXR0cmlidXRlKCBsYXp5U3JjQXR0ciApO1xuICAgIGxldCBjZWxsU3Jjc2V0QXR0ciA9IGNlbGxFbGVtLmdldEF0dHJpYnV0ZSggbGF6eVNyY3NldEF0dHIgKTtcbiAgICBpZiAoIGNlbGxBdHRyIHx8IGNlbGxTcmNBdHRyIHx8IGNlbGxTcmNzZXRBdHRyICkge1xuICAgICAgcmV0dXJuIGNlbGxFbGVtO1xuICAgIH1cbiAgfVxuICAvLyBzZWxlY3QgbGF6eSBpbWFnZXMgaW4gY2VsbFxuICByZXR1cm4gWyAuLi5jZWxsRWxlbS5xdWVyeVNlbGVjdG9yQWxsKCBpbWdTZWxlY3RvciApIF07XG59XG5cbnByb3RvLm9uTGF6eUxvYWRDb21wbGV0ZSA9IGZ1bmN0aW9uKCBpbWcsIGV2ZW50ICkge1xuICBsZXQgY2VsbCA9IHRoaXMuZ2V0UGFyZW50Q2VsbCggaW1nICk7XG4gIGxldCBjZWxsRWxlbSA9IGNlbGwgJiYgY2VsbC5lbGVtZW50O1xuICB0aGlzLmNlbGxTaXplQ2hhbmdlKCBjZWxsRWxlbSApO1xuXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2xhenlMb2FkJywgZXZlbnQsIGNlbGxFbGVtICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMYXp5TG9hZGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogY2xhc3MgdG8gaGFuZGxlIGxvYWRpbmcgaW1hZ2VzXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWcgLSBJbWFnZSBlbGVtZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkNvbXBsZXRlIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gTGF6eUxvYWRlciggaW1nLCBvbkNvbXBsZXRlICkge1xuICB0aGlzLmltZyA9IGltZztcbiAgdGhpcy5vbkNvbXBsZXRlID0gb25Db21wbGV0ZTtcbiAgdGhpcy5sb2FkKCk7XG59XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gdXRpbHMuaGFuZGxlRXZlbnQ7XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gZ2V0IHNyYyAmIHNyY3NldFxuICBsZXQgc3JjID0gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCBsYXp5QXR0ciApIHx8XG4gICAgdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCBsYXp5U3JjQXR0ciApO1xuICBsZXQgc3Jjc2V0ID0gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCBsYXp5U3Jjc2V0QXR0ciApO1xuICAvLyBzZXQgc3JjICYgc2Vyc2V0XG4gIHRoaXMuaW1nLnNyYyA9IHNyYztcbiAgaWYgKCBzcmNzZXQgKSB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoICdzcmNzZXQnLCBzcmNzZXQgKTtcbiAgLy8gcmVtb3ZlIGF0dHJcbiAgdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKCBsYXp5QXR0ciApO1xuICB0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoIGxhenlTcmNBdHRyICk7XG4gIHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZSggbGF6eVNyY3NldEF0dHIgKTtcbn07XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1sYXp5bG9hZGVkJyApO1xufTtcblxuTGF6eUxvYWRlci5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1sYXp5ZXJyb3InICk7XG59O1xuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCBldmVudCwgY2xhc3NOYW1lICkge1xuICAvLyB1bmJpbmQgZXZlbnRzXG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIGxldCBtZWRpYUVsZW0gPSB0aGlzLmltZy5wYXJlbnROb2RlLm1hdGNoZXMoJ3BpY3R1cmUnKSA/IHRoaXMuaW1nLnBhcmVudE5vZGUgOiB0aGlzLmltZztcbiAgbWVkaWFFbGVtLmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuXG4gIHRoaXMub25Db21wbGV0ZSggdGhpcy5pbWcsIGV2ZW50ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuTGF6eUxvYWRlciA9IExhenlMb2FkZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBwYWdlIGRvdHNcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9jb3JlJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICApO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSwgdXRpbHMgKSB7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBhZ2VEb3RzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIFBhZ2VEb3RzKCkge1xuICAvLyBjcmVhdGUgaG9sZGVyIGVsZW1lbnRcbiAgdGhpcy5ob2xkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGhpcy5ob2xkZXIuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LXBhZ2UtZG90cyc7XG4gIC8vIGNyZWF0ZSBkb3RzLCBhcnJheSBvZiBlbGVtZW50c1xuICB0aGlzLmRvdHMgPSBbXTtcbn1cblxuUGFnZURvdHMucHJvdG90eXBlLnNldERvdHMgPSBmdW5jdGlvbiggc2xpZGVzTGVuZ3RoICkge1xuICAvLyBnZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIG51bWJlciBvZiBzbGlkZXMgYW5kIG51bWJlciBvZiBkb3RzXG4gIGxldCBkZWx0YSA9IHNsaWRlc0xlbmd0aCAtIHRoaXMuZG90cy5sZW5ndGg7XG4gIGlmICggZGVsdGEgPiAwICkge1xuICAgIHRoaXMuYWRkRG90cyggZGVsdGEgKTtcbiAgfSBlbHNlIGlmICggZGVsdGEgPCAwICkge1xuICAgIHRoaXMucmVtb3ZlRG90cyggLWRlbHRhICk7XG4gIH1cbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5hZGREb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICBsZXQgbmV3RG90cyA9IG5ldyBBcnJheSggY291bnQgKS5maWxsKClcbiAgICAubWFwKCAoIGl0ZW0sIGkgKSA9PiB7XG4gICAgICBsZXQgZG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICBkb3Quc2V0QXR0cmlidXRlKCAndHlwZScsICdidXR0b24nICk7XG4gICAgICBsZXQgbnVtID0gaSArIDEgKyB0aGlzLmRvdHMubGVuZ3RoO1xuICAgICAgZG90LmNsYXNzTmFtZSA9ICdmbGlja2l0eS1wYWdlLWRvdCc7XG4gICAgICBkb3QudGV4dENvbnRlbnQgPSBgVmlldyBzbGlkZSAke251bX1gO1xuICAgICAgcmV0dXJuIGRvdDtcbiAgICB9ICk7XG5cbiAgdGhpcy5ob2xkZXIuYXBwZW5kKCAuLi5uZXdEb3RzICk7XG4gIHRoaXMuZG90cyA9IHRoaXMuZG90cy5jb25jYXQoIG5ld0RvdHMgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5yZW1vdmVEb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICAvLyByZW1vdmUgZnJvbSB0aGlzLmRvdHMgY29sbGVjdGlvblxuICBsZXQgcmVtb3ZlRG90cyA9IHRoaXMuZG90cy5zcGxpY2UoIHRoaXMuZG90cy5sZW5ndGggLSBjb3VudCwgY291bnQgKTtcbiAgLy8gcmVtb3ZlIGZyb20gRE9NXG4gIHJlbW92ZURvdHMuZm9yRWFjaCggKCBkb3QgKSA9PiBkb3QucmVtb3ZlKCkgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgLy8gcmVtb3ZlIHNlbGVjdGVkIGNsYXNzIG9uIHByZXZpb3VzXG4gIGlmICggdGhpcy5zZWxlY3RlZERvdCApIHtcbiAgICB0aGlzLnNlbGVjdGVkRG90LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXNlbGVjdGVkJyk7XG4gICAgdGhpcy5zZWxlY3RlZERvdC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcpO1xuICB9XG4gIC8vIGRvbid0IHByb2NlZWQgaWYgbm8gZG90c1xuICBpZiAoICF0aGlzLmRvdHMubGVuZ3RoICkgcmV0dXJuO1xuXG4gIHRoaXMuc2VsZWN0ZWREb3QgPSB0aGlzLmRvdHNbIGluZGV4IF07XG4gIHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NMaXN0LmFkZCgnaXMtc2VsZWN0ZWQnKTtcbiAgdGhpcy5zZWxlY3RlZERvdC5zZXRBdHRyaWJ1dGUoICdhcmlhLWN1cnJlbnQnLCAnc3RlcCcgKTtcbn07XG5cbkZsaWNraXR5LlBhZ2VEb3RzID0gUGFnZURvdHM7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEZsaWNraXR5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbk9iamVjdC5hc3NpZ24oIEZsaWNraXR5LmRlZmF1bHRzLCB7XG4gIHBhZ2VEb3RzOiB0cnVlLFxufSApO1xuXG5GbGlja2l0eS5jcmVhdGUucGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnBhZ2VEb3RzICkgcmV0dXJuO1xuXG4gIHRoaXMucGFnZURvdHMgPSBuZXcgUGFnZURvdHMoKTtcbiAgdGhpcy5oYW5kbGVQYWdlRG90c0NsaWNrID0gdGhpcy5vblBhZ2VEb3RzQ2xpY2suYmluZCggdGhpcyApO1xuICAvLyBldmVudHNcbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMgKTtcbiAgdGhpcy5vbiggJ2NlbGxDaGFuZ2UnLCB0aGlzLnVwZGF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdyZXNpemUnLCB0aGlzLnVwZGF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdkZWFjdGl2YXRlJywgdGhpcy5kZWFjdGl2YXRlUGFnZURvdHMgKTtcbn07XG5cbmxldCBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uYWN0aXZhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLnNldERvdHMoIHRoaXMuc2xpZGVzLmxlbmd0aCApO1xuICB0aGlzLmZvY3VzYWJsZUVsZW1zLnB1c2goIC4uLnRoaXMucGFnZURvdHMuZG90cyApO1xuICB0aGlzLnBhZ2VEb3RzLmhvbGRlci5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmhhbmRsZVBhZ2VEb3RzQ2xpY2sgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZCggdGhpcy5wYWdlRG90cy5ob2xkZXIgKTtcbn07XG5cbnByb3RvLm9uUGFnZURvdHNDbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgbGV0IGluZGV4ID0gdGhpcy5wYWdlRG90cy5kb3RzLmluZGV4T2YoIGV2ZW50LnRhcmdldCApO1xuICBpZiAoIGluZGV4ID09PSAtMSApIHJldHVybjsgLy8gb25seSBkb3QgY2xpY2tzXG5cbiAgdGhpcy51aUNoYW5nZSgpO1xuICB0aGlzLnNlbGVjdCggaW5kZXggKTtcbn07XG5cbnByb3RvLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCggdGhpcy5zZWxlY3RlZEluZGV4ICk7XG59O1xuXG5wcm90by51cGRhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLmRvdHMuZm9yRWFjaCggKCBkb3QgKSA9PiB7XG4gICAgdXRpbHMucmVtb3ZlRnJvbSggdGhpcy5mb2N1c2FibGVFbGVtcywgZG90ICk7XG4gIH0gKTtcbiAgdGhpcy5wYWdlRG90cy5zZXREb3RzKCB0aGlzLnNsaWRlcy5sZW5ndGggKTtcbiAgdGhpcy5mb2N1c2FibGVFbGVtcy5wdXNoKCAuLi50aGlzLnBhZ2VEb3RzLmRvdHMgKTtcbn07XG5cbnByb3RvLmRlYWN0aXZhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLmhvbGRlci5yZW1vdmUoKTtcbiAgdGhpcy5wYWdlRG90cy5ob2xkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5oYW5kbGVQYWdlRG90c0NsaWNrICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuUGFnZURvdHMgPSBQYWdlRG90cztcblxucmV0dXJuIEZsaWNraXR5O1xuXG59ICkgKTtcbiIsIi8vIHBsYXllciAmIGF1dG9QbGF5XG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoIHJlcXVpcmUoJy4vY29yZScpICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KCB3aW5kb3cuRmxpY2tpdHkgKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24gZmFjdG9yeSggRmxpY2tpdHkgKSB7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBsYXllciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBQbGF5ZXIoIGF1dG9QbGF5LCBvblRpY2sgKSB7XG4gIHRoaXMuYXV0b1BsYXkgPSBhdXRvUGxheTtcbiAgdGhpcy5vblRpY2sgPSBvblRpY2s7XG4gIHRoaXMuc3RhdGUgPSAnc3RvcHBlZCc7XG4gIC8vIHZpc2liaWxpdHkgY2hhbmdlIGV2ZW50IGhhbmRsZXJcbiAgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UgPSB0aGlzLnZpc2liaWxpdHlDaGFuZ2UuYmluZCggdGhpcyApO1xuICB0aGlzLm9uVmlzaWJpbGl0eVBsYXkgPSB0aGlzLnZpc2liaWxpdHlQbGF5LmJpbmQoIHRoaXMgKTtcbn1cblxuLy8gc3RhcnQgcGxheVxuUGxheWVyLnByb3RvdHlwZS5wbGF5ID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5zdGF0ZSA9PT0gJ3BsYXlpbmcnICkgcmV0dXJuO1xuXG4gIC8vIGRvIG5vdCBwbGF5IGlmIHBhZ2UgaXMgaGlkZGVuLCBzdGFydCBwbGF5aW5nIHdoZW4gcGFnZSBpcyB2aXNpYmxlXG4gIGxldCBpc1BhZ2VIaWRkZW4gPSBkb2N1bWVudC5oaWRkZW47XG4gIGlmICggaXNQYWdlSGlkZGVuICkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5vblZpc2liaWxpdHlQbGF5ICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5zdGF0ZSA9ICdwbGF5aW5nJztcbiAgLy8gbGlzdGVuIHRvIHZpc2liaWxpdHkgY2hhbmdlXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UgKTtcbiAgLy8gc3RhcnQgdGlja2luZ1xuICB0aGlzLnRpY2soKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKCkge1xuICAvLyBkbyBub3QgdGljayBpZiBub3QgcGxheWluZ1xuICBpZiAoIHRoaXMuc3RhdGUgIT09ICdwbGF5aW5nJyApIHJldHVybjtcblxuICAvLyBkZWZhdWx0IHRvIDMgc2Vjb25kc1xuICBsZXQgdGltZSA9IHR5cGVvZiB0aGlzLmF1dG9QbGF5ID09ICdudW1iZXInID8gdGhpcy5hdXRvUGxheSA6IDMwMDA7XG4gIC8vIEhBQ0s6IHJlc2V0IHRpY2tzIGlmIHN0b3BwZWQgYW5kIHN0YXJ0ZWQgd2l0aGluIGludGVydmFsXG4gIHRoaXMuY2xlYXIoKTtcbiAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCggKCkgPT4ge1xuICAgIHRoaXMub25UaWNrKCk7XG4gICAgdGhpcy50aWNrKCk7XG4gIH0sIHRpbWUgKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnN0YXRlID0gJ3N0b3BwZWQnO1xuICB0aGlzLmNsZWFyKCk7XG4gIC8vIHJlbW92ZSB2aXNpYmlsaXR5IGNoYW5nZSBldmVudFxuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAndmlzaWJpbGl0eWNoYW5nZScsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlICk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gIGNsZWFyVGltZW91dCggdGhpcy50aW1lb3V0ICk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5zdGF0ZSA9PT0gJ3BsYXlpbmcnICkge1xuICAgIHRoaXMuc3RhdGUgPSAncGF1c2VkJztcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUudW5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZS1zdGFydCBwbGF5IGlmIHBhdXNlZFxuICBpZiAoIHRoaXMuc3RhdGUgPT09ICdwYXVzZWQnICkgdGhpcy5wbGF5KCk7XG59O1xuXG4vLyBwYXVzZSBpZiBwYWdlIHZpc2liaWxpdHkgaXMgaGlkZGVuLCB1bnBhdXNlIGlmIHZpc2libGVcblBsYXllci5wcm90b3R5cGUudmlzaWJpbGl0eUNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgaXNQYWdlSGlkZGVuID0gZG9jdW1lbnQuaGlkZGVuO1xuICB0aGlzWyBpc1BhZ2VIaWRkZW4gPyAncGF1c2UnIDogJ3VucGF1c2UnIF0oKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudmlzaWJpbGl0eVBsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5KCk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5vblZpc2liaWxpdHlQbGF5ICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5PYmplY3QuYXNzaWduKCBGbGlja2l0eS5kZWZhdWx0cywge1xuICBwYXVzZUF1dG9QbGF5T25Ib3ZlcjogdHJ1ZSxcbn0gKTtcblxuRmxpY2tpdHkuY3JlYXRlLnBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoIHRoaXMub3B0aW9ucy5hdXRvUGxheSwgKCkgPT4ge1xuICAgIHRoaXMubmV4dCggdHJ1ZSApO1xuICB9ICk7XG5cbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVBsYXllciApO1xuICB0aGlzLm9uKCAndWlDaGFuZ2UnLCB0aGlzLnN0b3BQbGF5ZXIgKTtcbiAgdGhpcy5vbiggJ3BvaW50ZXJEb3duJywgdGhpcy5zdG9wUGxheWVyICk7XG4gIHRoaXMub24oICdkZWFjdGl2YXRlJywgdGhpcy5kZWFjdGl2YXRlUGxheWVyICk7XG59O1xuXG5sZXQgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLmFjdGl2YXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5hdXRvUGxheSApIHJldHVybjtcblxuICB0aGlzLnBsYXllci5wbGF5KCk7XG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2VlbnRlcicsIHRoaXMgKTtcbn07XG5cbi8vIFBsYXllciBBUEksIGRvbid0IGhhdGUgdGhlIC4uLiB0aGFua3MgSSBrbm93IHdoZXJlIHRoZSBkb29yIGlzXG5cbnByb3RvLnBsYXlQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIucGxheSgpO1xufTtcblxucHJvdG8uc3RvcFBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5zdG9wKCk7XG59O1xuXG5wcm90by5wYXVzZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5wYXVzZSgpO1xufTtcblxucHJvdG8udW5wYXVzZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci51bnBhdXNlKCk7XG59O1xuXG5wcm90by5kZWFjdGl2YXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnN0b3AoKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWVudGVyJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gbW91c2VlbnRlci9sZWF2ZSAtLS0tLSAvL1xuXG4vLyBwYXVzZSBhdXRvLXBsYXkgb24gaG92ZXJcbnByb3RvLm9ubW91c2VlbnRlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucGF1c2VBdXRvUGxheU9uSG92ZXIgKSByZXR1cm47XG5cbiAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWxlYXZlJywgdGhpcyApO1xufTtcblxuLy8gcmVzdW1lIGF1dG8tcGxheSBvbiBob3ZlciBvZmZcbnByb3RvLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci51bnBhdXNlKCk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2VsZWF2ZScsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5QbGF5ZXIgPSBQbGF5ZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBwcmV2L25leHQgYnV0dG9uc1xuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCByZXF1aXJlKCcuL2NvcmUnKSApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeSggd2luZG93LkZsaWNraXR5ICk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5ICkge1xuXG5jb25zdCBzdmdVUkkgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQcmV2TmV4dEJ1dHRvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBQcmV2TmV4dEJ1dHRvbiggaW5jcmVtZW50LCBkaXJlY3Rpb24sIGFycm93U2hhcGUgKSB7XG4gIHRoaXMuaW5jcmVtZW50ID0gaW5jcmVtZW50O1xuICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgdGhpcy5pc1ByZXZpb3VzID0gaW5jcmVtZW50ID09PSAncHJldmlvdXMnO1xuICB0aGlzLmlzTGVmdCA9IGRpcmVjdGlvbiA9PT0gJ2xlZnQnO1xuICB0aGlzLl9jcmVhdGUoIGFycm93U2hhcGUgKTtcbn1cblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLl9jcmVhdGUgPSBmdW5jdGlvbiggYXJyb3dTaGFwZSApIHtcbiAgLy8gcHJvcGVydGllc1xuICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBlbGVtZW50LmNsYXNzTmFtZSA9IGBmbGlja2l0eS1idXR0b24gZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvbiAke3RoaXMuaW5jcmVtZW50fWA7XG4gIGxldCBsYWJlbCA9IHRoaXMuaXNQcmV2aW91cyA/ICdQcmV2aW91cycgOiAnTmV4dCc7XG4gIC8vIHByZXZlbnQgYnV0dG9uIGZyb20gc3VibWl0dGluZyBmb3JtIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDgzNjA3Ni8xODIxODNcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2J1dHRvbicgKTtcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJywgbGFiZWwgKTtcbiAgLy8gaW5pdCBhcyBkaXNhYmxlZFxuICB0aGlzLmRpc2FibGUoKTtcbiAgLy8gY3JlYXRlIGFycm93XG4gIGxldCBzdmcgPSB0aGlzLmNyZWF0ZVNWRyggbGFiZWwsIGFycm93U2hhcGUgKTtcbiAgZWxlbWVudC5hcHBlbmQoIHN2ZyApO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmNyZWF0ZVNWRyA9IGZ1bmN0aW9uKCBsYWJlbCwgYXJyb3dTaGFwZSApIHtcbiAgbGV0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnVVJJLCAnc3ZnJyApO1xuICBzdmcuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnZmxpY2tpdHktYnV0dG9uLWljb24nICk7XG4gIHN2Zy5zZXRBdHRyaWJ1dGUoICd2aWV3Qm94JywgJzAgMCAxMDAgMTAwJyApO1xuICAvLyBhZGQgdGl0bGUgIzExODlcbiAgbGV0IHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmdVUkksICd0aXRsZScgKTtcbiAgdGl0bGUuYXBwZW5kKCBsYWJlbCApO1xuICAvLyBhZGQgcGF0aFxuICBsZXQgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnVVJJLCAncGF0aCcgKTtcbiAgbGV0IHBhdGhNb3ZlbWVudHMgPSBnZXRBcnJvd01vdmVtZW50cyggYXJyb3dTaGFwZSApO1xuICBwYXRoLnNldEF0dHJpYnV0ZSggJ2QnLCBwYXRoTW92ZW1lbnRzICk7XG4gIHBhdGguc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnYXJyb3cnICk7XG4gIC8vIHJvdGF0ZSBhcnJvd1xuICBpZiAoICF0aGlzLmlzTGVmdCApIHtcbiAgICBwYXRoLnNldEF0dHJpYnV0ZSggJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSgxODApJyApO1xuICB9XG4gIHN2Zy5hcHBlbmQoIHRpdGxlLCBwYXRoICk7XG4gIHJldHVybiBzdmc7XG59O1xuXG4vLyBnZXQgU1ZHIHBhdGggbW92bWVtZW50XG5mdW5jdGlvbiBnZXRBcnJvd01vdmVtZW50cyggc2hhcGUgKSB7XG4gIC8vIHVzZSBzaGFwZSBhcyBtb3ZlbWVudCBpZiBzdHJpbmdcbiAgaWYgKCB0eXBlb2Ygc2hhcGUgPT0gJ3N0cmluZycgKSByZXR1cm4gc2hhcGU7XG5cbiAgbGV0IHsgeDAsIHgxLCB4MiwgeDMsIHkxLCB5MiB9ID0gc2hhcGU7XG5cbiAgLy8gY3JlYXRlIG1vdmVtZW50IHN0cmluZ1xuICByZXR1cm4gYE0gJHt4MH0sIDUwXG4gICAgTCAke3gxfSwgJHt5MSArIDUwfVxuICAgIEwgJHt4Mn0sICR7eTIgKyA1MH1cbiAgICBMICR7eDN9LCA1MFxuICAgIEwgJHt4Mn0sICR7NTAgLSB5Mn1cbiAgICBMICR7eDF9LCAkezUwIC0geTF9XG4gICAgWmA7XG59XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCAnZGlzYWJsZWQnLCB0cnVlICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuT2JqZWN0LmFzc2lnbiggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgcHJldk5leHRCdXR0b25zOiB0cnVlLFxuICBhcnJvd1NoYXBlOiB7XG4gICAgeDA6IDEwLFxuICAgIHgxOiA2MCwgeTE6IDUwLFxuICAgIHgyOiA3MCwgeTI6IDQwLFxuICAgIHgzOiAzMCxcbiAgfSxcbn0gKTtcblxuRmxpY2tpdHkuY3JlYXRlLnByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zICkgcmV0dXJuO1xuXG4gIGxldCB7IHJpZ2h0VG9MZWZ0LCBhcnJvd1NoYXBlIH0gPSB0aGlzLm9wdGlvbnM7XG4gIGxldCBwcmV2RGlyZWN0aW9uID0gcmlnaHRUb0xlZnQgPyAncmlnaHQnIDogJ2xlZnQnO1xuICBsZXQgbmV4dERpcmVjdGlvbiA9IHJpZ2h0VG9MZWZ0ID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgdGhpcy5wcmV2QnV0dG9uID0gbmV3IFByZXZOZXh0QnV0dG9uKCAncHJldmlvdXMnLCBwcmV2RGlyZWN0aW9uLCBhcnJvd1NoYXBlICk7XG4gIHRoaXMubmV4dEJ1dHRvbiA9IG5ldyBQcmV2TmV4dEJ1dHRvbiggJ25leHQnLCBuZXh0RGlyZWN0aW9uLCBhcnJvd1NoYXBlICk7XG4gIHRoaXMuZm9jdXNhYmxlRWxlbXMucHVzaCggdGhpcy5wcmV2QnV0dG9uLmVsZW1lbnQgKTtcbiAgdGhpcy5mb2N1c2FibGVFbGVtcy5wdXNoKCB0aGlzLm5leHRCdXR0b24uZWxlbWVudCApO1xuXG4gIHRoaXMuaGFuZGxlUHJldkJ1dHRvbkNsaWNrID0gKCkgPT4ge1xuICAgIHRoaXMudWlDaGFuZ2UoKTtcbiAgICB0aGlzLnByZXZpb3VzKCk7XG4gIH07XG5cbiAgdGhpcy5oYW5kbGVOZXh0QnV0dG9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgdGhpcy51aUNoYW5nZSgpO1xuICAgIHRoaXMubmV4dCgpO1xuICB9O1xuXG4gIHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMgKTtcbiAgdGhpcy5vbiggJ3NlbGVjdCcsIHRoaXMudXBkYXRlUHJldk5leHRCdXR0b25zICk7XG59O1xuXG5sZXQgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLnVwZGF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICBsZXQgbGFzdEluZGV4ID0gdGhpcy5zbGlkZXMubGVuZ3RoID8gdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSA6IDA7XG4gIHRoaXMudXBkYXRlUHJldk5leHRCdXR0b24oIHRoaXMucHJldkJ1dHRvbiwgMCApO1xuICB0aGlzLnVwZGF0ZVByZXZOZXh0QnV0dG9uKCB0aGlzLm5leHRCdXR0b24sIGxhc3RJbmRleCApO1xufTtcblxucHJvdG8udXBkYXRlUHJldk5leHRCdXR0b24gPSBmdW5jdGlvbiggYnV0dG9uLCBkaXNhYmxlZEluZGV4ICkge1xuICAvLyBlbmFibGUgaXMgd3JhcEFyb3VuZCBhbmQgYXQgbGVhc3QgMiBzbGlkZXNcbiAgaWYgKCB0aGlzLmlzV3JhcHBpbmcgJiYgdGhpcy5zbGlkZXMubGVuZ3RoID4gMSApIHtcbiAgICBidXR0b24uZW5hYmxlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbGV0IGlzRW5hYmxlZCA9IHRoaXMuc2VsZWN0ZWRJbmRleCAhPT0gZGlzYWJsZWRJbmRleDtcbiAgYnV0dG9uWyBpc0VuYWJsZWQgPyAnZW5hYmxlJyA6ICdkaXNhYmxlJyBdKCk7XG4gIC8vIGlmIGRpc2FibGluZyBidXR0b24gdGhhdCBpcyBmb2N1c2VkLFxuICAvLyBzaGlmdCBmb2N1cyB0byBlbGVtZW50IHRvIG1haW50YWluIGtleWJvYXJkIGFjY2Vzc2liaWxpdHlcbiAgbGV0IGlzRGlzYWJsZWRGb2N1c2VkID0gIWlzRW5hYmxlZCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBidXR0b24uZWxlbWVudDtcbiAgaWYgKCBpc0Rpc2FibGVkRm9jdXNlZCApIHRoaXMuZm9jdXMoKTtcbn07XG5cbnByb3RvLmFjdGl2YXRlUHJldk5leHRCdXR0b25zID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJldkJ1dHRvbi5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlUHJldkJ1dHRvbkNsaWNrICk7XG4gIHRoaXMubmV4dEJ1dHRvbi5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlTmV4dEJ1dHRvbkNsaWNrICk7XG4gIHRoaXMuZWxlbWVudC5hcHBlbmQoIHRoaXMucHJldkJ1dHRvbi5lbGVtZW50LCB0aGlzLm5leHRCdXR0b24uZWxlbWVudCApO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxucHJvdG8uZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByZXZCdXR0b24uZWxlbWVudC5yZW1vdmUoKTtcbiAgdGhpcy5uZXh0QnV0dG9uLmVsZW1lbnQucmVtb3ZlKCk7XG4gIHRoaXMucHJldkJ1dHRvbi5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlUHJldkJ1dHRvbkNsaWNrICk7XG4gIHRoaXMubmV4dEJ1dHRvbi5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlTmV4dEJ1dHRvbkNsaWNrICk7XG4gIHRoaXMub2ZmKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkZsaWNraXR5LlByZXZOZXh0QnV0dG9uID0gUHJldk5leHRCdXR0b247XG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBzbGlkZVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHkgfHwge307XG4gICAgd2luZG93LkZsaWNraXR5LlNsaWRlID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuXG5mdW5jdGlvbiBTbGlkZSggYmVnaW5NYXJnaW4sIGVuZE1hcmdpbiwgY2VsbEFsaWduICkge1xuICB0aGlzLmJlZ2luTWFyZ2luID0gYmVnaW5NYXJnaW47XG4gIHRoaXMuZW5kTWFyZ2luID0gZW5kTWFyZ2luO1xuICB0aGlzLmNlbGxBbGlnbiA9IGNlbGxBbGlnbjtcbiAgdGhpcy5jZWxscyA9IFtdO1xuICB0aGlzLm91dGVyV2lkdGggPSAwO1xuICB0aGlzLmhlaWdodCA9IDA7XG59XG5cbmxldCBwcm90byA9IFNsaWRlLnByb3RvdHlwZTtcblxucHJvdG8uYWRkQ2VsbCA9IGZ1bmN0aW9uKCBjZWxsICkge1xuICB0aGlzLmNlbGxzLnB1c2goIGNlbGwgKTtcbiAgdGhpcy5vdXRlcldpZHRoICs9IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB0aGlzLmhlaWdodCA9IE1hdGgubWF4KCBjZWxsLnNpemUub3V0ZXJIZWlnaHQsIHRoaXMuaGVpZ2h0ICk7XG4gIC8vIGZpcnN0IGNlbGwgc3R1ZmZcbiAgaWYgKCB0aGlzLmNlbGxzLmxlbmd0aCA9PT0gMSApIHtcbiAgICB0aGlzLnggPSBjZWxsLng7IC8vIHggY29tZXMgZnJvbSBmaXJzdCBjZWxsXG4gICAgdGhpcy5maXJzdE1hcmdpbiA9IGNlbGwuc2l6ZVsgdGhpcy5iZWdpbk1hcmdpbiBdO1xuICB9XG59O1xuXG5wcm90by51cGRhdGVUYXJnZXQgPSBmdW5jdGlvbigpIHtcbiAgbGV0IGxhc3RDZWxsID0gdGhpcy5nZXRMYXN0Q2VsbCgpO1xuICBsZXQgbGFzdE1hcmdpbiA9IGxhc3RDZWxsID8gbGFzdENlbGwuc2l6ZVsgdGhpcy5lbmRNYXJnaW4gXSA6IDA7XG4gIGxldCBzbGlkZVdpZHRoID0gdGhpcy5vdXRlcldpZHRoIC0gKCB0aGlzLmZpcnN0TWFyZ2luICsgbGFzdE1hcmdpbiApO1xuICB0aGlzLnRhcmdldCA9IHRoaXMueCArIHRoaXMuZmlyc3RNYXJnaW4gKyBzbGlkZVdpZHRoICogdGhpcy5jZWxsQWxpZ247XG59O1xuXG5wcm90by5nZXRMYXN0Q2VsbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxsc1sgdGhpcy5jZWxscy5sZW5ndGggLSAxIF07XG59O1xuXG5wcm90by5zZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jZWxscy5mb3JFYWNoKCAoIGNlbGwgKSA9PiBjZWxsLnNlbGVjdCgpICk7XG59O1xuXG5wcm90by51bnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNlbGxzLmZvckVhY2goICggY2VsbCApID0+IGNlbGwudW5zZWxlY3QoKSApO1xufTtcblxucHJvdG8uZ2V0Q2VsbEVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmNlbGxzLm1hcCggKCBjZWxsICkgPT4gY2VsbC5lbGVtZW50ICk7XG59O1xuXG5yZXR1cm4gU2xpZGU7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBJbmZpbml0ZSBTY3JvbGwgdjIuMC40XG4gKiBtZWFzdXJlIHNpemUgb2YgZWxlbWVudHNcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5nZXRTaXplID0gZmFjdG9yeSgpO1xuICB9XG5cbn0gKSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCBhIG51bWJlciBmcm9tIGEgc3RyaW5nLCBub3QgYSBwZXJjZW50YWdlXG5mdW5jdGlvbiBnZXRTdHlsZVNpemUoIHZhbHVlICkge1xuICBsZXQgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgLy8gbm90IGEgcGVyY2VudCBsaWtlICcxMDAlJywgYW5kIGEgbnVtYmVyXG4gIGxldCBpc1ZhbGlkID0gdmFsdWUuaW5kZXhPZignJScpID09IC0xICYmICFpc05hTiggbnVtICk7XG4gIHJldHVybiBpc1ZhbGlkICYmIG51bTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWVhc3VyZW1lbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmxldCBtZWFzdXJlbWVudHMgPSBbXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ21hcmdpbkxlZnQnLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnbWFyZ2luVG9wJyxcbiAgJ21hcmdpbkJvdHRvbScsXG4gICdib3JkZXJMZWZ0V2lkdGgnLFxuICAnYm9yZGVyUmlnaHRXaWR0aCcsXG4gICdib3JkZXJUb3BXaWR0aCcsXG4gICdib3JkZXJCb3R0b21XaWR0aCcsXG5dO1xuXG5sZXQgbWVhc3VyZW1lbnRzTGVuZ3RoID0gbWVhc3VyZW1lbnRzLmxlbmd0aDtcblxuZnVuY3Rpb24gZ2V0WmVyb1NpemUoKSB7XG4gIGxldCBzaXplID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICBpbm5lcldpZHRoOiAwLFxuICAgIGlubmVySGVpZ2h0OiAwLFxuICAgIG91dGVyV2lkdGg6IDAsXG4gICAgb3V0ZXJIZWlnaHQ6IDAsXG4gIH07XG4gIG1lYXN1cmVtZW50cy5mb3JFYWNoKCAoIG1lYXN1cmVtZW50ICkgPT4ge1xuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAwO1xuICB9ICk7XG4gIHJldHVybiBzaXplO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTaXplIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGdldFNpemUoIGVsZW0gKSB7XG4gIC8vIHVzZSBxdWVyeVNlbGV0b3IgaWYgZWxlbSBpcyBzdHJpbmdcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG5cbiAgLy8gZG8gbm90IHByb2NlZWQgb24gbm9uLW9iamVjdHNcbiAgbGV0IGlzRWxlbWVudCA9IGVsZW0gJiYgdHlwZW9mIGVsZW0gPT0gJ29iamVjdCcgJiYgZWxlbS5ub2RlVHlwZTtcbiAgaWYgKCAhaXNFbGVtZW50ICkgcmV0dXJuO1xuXG4gIGxldCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcblxuICAvLyBpZiBoaWRkZW4sIGV2ZXJ5dGhpbmcgaXMgMFxuICBpZiAoIHN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnICkgcmV0dXJuIGdldFplcm9TaXplKCk7XG5cbiAgbGV0IHNpemUgPSB7fTtcbiAgc2l6ZS53aWR0aCA9IGVsZW0ub2Zmc2V0V2lkdGg7XG4gIHNpemUuaGVpZ2h0ID0gZWxlbS5vZmZzZXRIZWlnaHQ7XG5cbiAgbGV0IGlzQm9yZGVyQm94ID0gc2l6ZS5pc0JvcmRlckJveCA9IHN0eWxlLmJveFNpemluZyA9PSAnYm9yZGVyLWJveCc7XG5cbiAgLy8gZ2V0IGFsbCBtZWFzdXJlbWVudHNcbiAgbWVhc3VyZW1lbnRzLmZvckVhY2goICggbWVhc3VyZW1lbnQgKSA9PiB7XG4gICAgbGV0IHZhbHVlID0gc3R5bGVbIG1lYXN1cmVtZW50IF07XG4gICAgbGV0IG51bSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gICAgLy8gYW55ICdhdXRvJywgJ21lZGl1bScgdmFsdWUgd2lsbCBiZSAwXG4gICAgc2l6ZVsgbWVhc3VyZW1lbnQgXSA9ICFpc05hTiggbnVtICkgPyBudW0gOiAwO1xuICB9ICk7XG5cbiAgbGV0IHBhZGRpbmdXaWR0aCA9IHNpemUucGFkZGluZ0xlZnQgKyBzaXplLnBhZGRpbmdSaWdodDtcbiAgbGV0IHBhZGRpbmdIZWlnaHQgPSBzaXplLnBhZGRpbmdUb3AgKyBzaXplLnBhZGRpbmdCb3R0b207XG4gIGxldCBtYXJnaW5XaWR0aCA9IHNpemUubWFyZ2luTGVmdCArIHNpemUubWFyZ2luUmlnaHQ7XG4gIGxldCBtYXJnaW5IZWlnaHQgPSBzaXplLm1hcmdpblRvcCArIHNpemUubWFyZ2luQm90dG9tO1xuICBsZXQgYm9yZGVyV2lkdGggPSBzaXplLmJvcmRlckxlZnRXaWR0aCArIHNpemUuYm9yZGVyUmlnaHRXaWR0aDtcbiAgbGV0IGJvcmRlckhlaWdodCA9IHNpemUuYm9yZGVyVG9wV2lkdGggKyBzaXplLmJvcmRlckJvdHRvbVdpZHRoO1xuXG4gIC8vIG92ZXJ3cml0ZSB3aWR0aCBhbmQgaGVpZ2h0IGlmIHdlIGNhbiBnZXQgaXQgZnJvbSBzdHlsZVxuICBsZXQgc3R5bGVXaWR0aCA9IGdldFN0eWxlU2l6ZSggc3R5bGUud2lkdGggKTtcbiAgaWYgKCBzdHlsZVdpZHRoICE9PSBmYWxzZSApIHtcbiAgICBzaXplLndpZHRoID0gc3R5bGVXaWR0aCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94ID8gMCA6IHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIH1cblxuICBsZXQgc3R5bGVIZWlnaHQgPSBnZXRTdHlsZVNpemUoIHN0eWxlLmhlaWdodCApO1xuICBpZiAoIHN0eWxlSGVpZ2h0ICE9PSBmYWxzZSApIHtcbiAgICBzaXplLmhlaWdodCA9IHN0eWxlSGVpZ2h0ICtcbiAgICAgIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgdW5sZXNzIGl0J3MgYWxyZWFkeSBpbmNsdWRpbmcgaXRcbiAgICAgICggaXNCb3JkZXJCb3ggPyAwIDogcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuICB9XG5cbiAgc2l6ZS5pbm5lcldpZHRoID0gc2l6ZS53aWR0aCAtICggcGFkZGluZ1dpZHRoICsgYm9yZGVyV2lkdGggKTtcbiAgc2l6ZS5pbm5lckhlaWdodCA9IHNpemUuaGVpZ2h0IC0gKCBwYWRkaW5nSGVpZ2h0ICsgYm9yZGVySGVpZ2h0ICk7XG5cbiAgc2l6ZS5vdXRlcldpZHRoID0gc2l6ZS53aWR0aCArIG1hcmdpbldpZHRoO1xuICBzaXplLm91dGVySGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKyBtYXJnaW5IZWlnaHQ7XG5cbiAgcmV0dXJuIHNpemU7XG59XG5cbnJldHVybiBnZXRTaXplO1xuXG59ICk7XG4iLCIvKiFcbiAqIGltYWdlc0xvYWRlZCB2NS4wLjBcbiAqIEphdmFTY3JpcHQgaXMgYWxsIGxpa2UgXCJZb3UgaW1hZ2VzIGFyZSBkb25lIHlldCBvciB3aGF0P1wiXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSggd2luZG93LCByZXF1aXJlKCdldi1lbWl0dGVyJykgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5pbWFnZXNMb2FkZWQgPSBmYWN0b3J5KCB3aW5kb3csIHdpbmRvdy5FdkVtaXR0ZXIgKTtcbiAgfVxuXG59ICkoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyxcbiAgICBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxubGV0ICQgPSB3aW5kb3cualF1ZXJ5O1xubGV0IGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbWFrZUFycmF5KCBvYmogKSB7XG4gIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkgcmV0dXJuIG9iajtcblxuICBsZXQgaXNBcnJheUxpa2UgPSB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInO1xuICAvLyBjb252ZXJ0IG5vZGVMaXN0IHRvIGFycmF5XG4gIGlmICggaXNBcnJheUxpa2UgKSByZXR1cm4gWyAuLi5vYmogXTtcblxuICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgcmV0dXJuIFsgb2JqIF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGltYWdlc0xvYWRlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIEBwYXJhbSB7W0FycmF5LCBFbGVtZW50LCBOb2RlTGlzdCwgU3RyaW5nXX0gZWxlbVxuICogQHBhcmFtIHtbT2JqZWN0LCBGdW5jdGlvbl19IG9wdGlvbnMgLSBpZiBmdW5jdGlvbiwgdXNlIGFzIGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkFsd2F5cyAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKiBAcmV0dXJucyB7SW1hZ2VzTG9hZGVkfVxuICovXG5mdW5jdGlvbiBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICkge1xuICAvLyBjb2VyY2UgSW1hZ2VzTG9hZGVkKCkgd2l0aG91dCBuZXcsIHRvIGJlIG5ldyBJbWFnZXNMb2FkZWQoKVxuICBpZiAoICEoIHRoaXMgaW5zdGFuY2VvZiBJbWFnZXNMb2FkZWQgKSApIHtcbiAgICByZXR1cm4gbmV3IEltYWdlc0xvYWRlZCggZWxlbSwgb3B0aW9ucywgb25BbHdheXMgKTtcbiAgfVxuICAvLyB1c2UgZWxlbSBhcyBzZWxlY3RvciBzdHJpbmdcbiAgbGV0IHF1ZXJ5RWxlbSA9IGVsZW07XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcXVlcnlFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggZWxlbSApO1xuICB9XG4gIC8vIGJhaWwgaWYgYmFkIGVsZW1lbnRcbiAgaWYgKCAhcXVlcnlFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEJhZCBlbGVtZW50IGZvciBpbWFnZXNMb2FkZWQgJHtxdWVyeUVsZW0gfHwgZWxlbX1gKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmVsZW1lbnRzID0gbWFrZUFycmF5KCBxdWVyeUVsZW0gKTtcbiAgdGhpcy5vcHRpb25zID0ge307XG4gIC8vIHNoaWZ0IGFyZ3VtZW50cyBpZiBubyBvcHRpb25zIHNldFxuICBpZiAoIHR5cGVvZiBvcHRpb25zID09ICdmdW5jdGlvbicgKSB7XG4gICAgb25BbHdheXMgPSBvcHRpb25zO1xuICB9IGVsc2Uge1xuICAgIE9iamVjdC5hc3NpZ24oIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuICB9XG5cbiAgaWYgKCBvbkFsd2F5cyApIHRoaXMub24oICdhbHdheXMnLCBvbkFsd2F5cyApO1xuXG4gIHRoaXMuZ2V0SW1hZ2VzKCk7XG4gIC8vIGFkZCBqUXVlcnkgRGVmZXJyZWQgb2JqZWN0XG4gIGlmICggJCApIHRoaXMuanFEZWZlcnJlZCA9IG5ldyAkLkRlZmVycmVkKCk7XG5cbiAgLy8gSEFDSyBjaGVjayBhc3luYyB0byBhbGxvdyB0aW1lIHRvIGJpbmQgbGlzdGVuZXJzXG4gIHNldFRpbWVvdXQoIHRoaXMuY2hlY2suYmluZCggdGhpcyApICk7XG59XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuZ2V0SW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGFuIGl0ZW0gc2VsZWN0b3JcbiAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKCB0aGlzLmFkZEVsZW1lbnRJbWFnZXMsIHRoaXMgKTtcbn07XG5cbmNvbnN0IGVsZW1lbnROb2RlVHlwZXMgPSBbIDEsIDksIDExIF07XG5cbi8qKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtXG4gKi9cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAvLyBmaWx0ZXIgc2libGluZ3NcbiAgaWYgKCBlbGVtLm5vZGVOYW1lID09PSAnSU1HJyApIHtcbiAgICB0aGlzLmFkZEltYWdlKCBlbGVtICk7XG4gIH1cbiAgLy8gZ2V0IGJhY2tncm91bmQgaW1hZ2Ugb24gZWxlbWVudFxuICBpZiAoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09PSB0cnVlICkge1xuICAgIHRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMoIGVsZW0gKTtcbiAgfVxuXG4gIC8vIGZpbmQgY2hpbGRyZW5cbiAgLy8gbm8gbm9uLWVsZW1lbnQgbm9kZXMsICMxNDNcbiAgbGV0IHsgbm9kZVR5cGUgfSA9IGVsZW07XG4gIGlmICggIW5vZGVUeXBlIHx8ICFlbGVtZW50Tm9kZVR5cGVzLmluY2x1ZGVzKCBub2RlVHlwZSApICkgcmV0dXJuO1xuXG4gIGxldCBjaGlsZEltZ3MgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICBmb3IgKCBsZXQgaW1nIG9mIGNoaWxkSW1ncyApIHtcbiAgICB0aGlzLmFkZEltYWdlKCBpbWcgKTtcbiAgfVxuXG4gIC8vIGdldCBjaGlsZCBiYWNrZ3JvdW5kIGltYWdlc1xuICBpZiAoIHR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PSAnc3RyaW5nJyApIHtcbiAgICBsZXQgY2hpbGRyZW4gPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kICk7XG4gICAgZm9yICggbGV0IGNoaWxkIG9mIGNoaWxkcmVuICkge1xuICAgICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggY2hpbGQgKTtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IHJlVVJMID0gL3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2k7XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgbGV0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSApO1xuICAvLyBGaXJlZm94IHJldHVybnMgbnVsbCBpZiBpbiBhIGhpZGRlbiBpZnJhbWUgaHR0cHM6Ly9idWd6aWwubGEvNTQ4Mzk3XG4gIGlmICggIXN0eWxlICkgcmV0dXJuO1xuXG4gIC8vIGdldCB1cmwgaW5zaWRlIHVybChcIi4uLlwiKVxuICBsZXQgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB3aGlsZSAoIG1hdGNoZXMgIT09IG51bGwgKSB7XG4gICAgbGV0IHVybCA9IG1hdGNoZXMgJiYgbWF0Y2hlc1syXTtcbiAgICBpZiAoIHVybCApIHtcbiAgICAgIHRoaXMuYWRkQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gICAgfVxuICAgIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWdcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcgKSB7XG4gIGxldCBsb2FkaW5nSW1hZ2UgPSBuZXcgTG9hZGluZ0ltYWdlKCBpbWcgKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggbG9hZGluZ0ltYWdlICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiggdXJsLCBlbGVtICkge1xuICBsZXQgYmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggYmFja2dyb3VuZCApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCA9IDA7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gZmFsc2U7XG4gIC8vIGNvbXBsZXRlIGlmIG5vIGltYWdlc1xuICBpZiAoICF0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBmdW5jLXN0eWxlICovXG4gIGxldCBvblByb2dyZXNzID0gKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApID0+IHtcbiAgICAvLyBIQUNLIC0gQ2hyb21lIHRyaWdnZXJzIGV2ZW50IGJlZm9yZSBvYmplY3QgcHJvcGVydGllcyBoYXZlIGNoYW5nZWQuICM4M1xuICAgIHNldFRpbWVvdXQoICgpID0+IHtcbiAgICAgIHRoaXMucHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICk7XG4gICAgfSApO1xuICB9O1xuXG4gIHRoaXMuaW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBsb2FkaW5nSW1hZ2UgKSB7XG4gICAgbG9hZGluZ0ltYWdlLm9uY2UoICdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MgKTtcbiAgICBsb2FkaW5nSW1hZ2UuY2hlY2soKTtcbiAgfSApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApIHtcbiAgdGhpcy5wcm9ncmVzc2VkQ291bnQrKztcbiAgdGhpcy5oYXNBbnlCcm9rZW4gPSB0aGlzLmhhc0FueUJyb2tlbiB8fCAhaW1hZ2UuaXNMb2FkZWQ7XG4gIC8vIHByb2dyZXNzIGV2ZW50XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIGltYWdlLCBlbGVtIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgJiYgdGhpcy5qcURlZmVycmVkLm5vdGlmeSApIHtcbiAgICB0aGlzLmpxRGVmZXJyZWQubm90aWZ5KCB0aGlzLCBpbWFnZSApO1xuICB9XG4gIC8vIGNoZWNrIGlmIGNvbXBsZXRlZFxuICBpZiAoIHRoaXMucHJvZ3Jlc3NlZENvdW50ID09PSB0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZGVidWcgJiYgY29uc29sZSApIHtcbiAgICBjb25zb2xlLmxvZyggYHByb2dyZXNzOiAke21lc3NhZ2V9YCwgaW1hZ2UsIGVsZW0gKTtcbiAgfVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgZXZlbnROYW1lID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAnZmFpbCcgOiAnZG9uZSc7XG4gIHRoaXMuaXNDb21wbGV0ZSA9IHRydWU7XG4gIHRoaXMuZW1pdEV2ZW50KCBldmVudE5hbWUsIFsgdGhpcyBdICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnYWx3YXlzJywgWyB0aGlzIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgKSB7XG4gICAgbGV0IGpxTWV0aG9kID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAncmVqZWN0JyA6ICdyZXNvbHZlJztcbiAgICB0aGlzLmpxRGVmZXJyZWRbIGpxTWV0aG9kIF0oIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIExvYWRpbmdJbWFnZSggaW1nICkge1xuICB0aGlzLmltZyA9IGltZztcbn1cblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICAvLyBJZiBjb21wbGV0ZSBpcyB0cnVlIGFuZCBicm93c2VyIHN1cHBvcnRzIG5hdHVyYWwgc2l6ZXMsXG4gIC8vIHRyeSB0byBjaGVjayBmb3IgaW1hZ2Ugc3RhdHVzIG1hbnVhbGx5LlxuICBsZXQgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICAvLyByZXBvcnQgYmFzZWQgb24gbmF0dXJhbFdpZHRoXG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgY2hlY2tzIGFib3ZlIG1hdGNoZWQsIHNpbXVsYXRlIGxvYWRpbmcgb24gZGV0YWNoZWQgZWxlbWVudC5cbiAgdGhpcy5wcm94eUltYWdlID0gbmV3IEltYWdlKCk7XG4gIC8vIGFkZCBjcm9zc09yaWdpbiBhdHRyaWJ1dGUuICMyMDRcbiAgaWYgKCB0aGlzLmltZy5jcm9zc09yaWdpbiApIHtcbiAgICB0aGlzLnByb3h5SW1hZ2UuY3Jvc3NPcmlnaW4gPSB0aGlzLmltZy5jcm9zc09yaWdpbjtcbiAgfVxuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGJpbmQgdG8gaW1hZ2UgYXMgd2VsbCBmb3IgRmlyZWZveC4gIzE5MVxuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2Uuc3JjID0gdGhpcy5pbWcuY3VycmVudFNyYyB8fCB0aGlzLmltZy5zcmM7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjaGVjayBmb3Igbm9uLXplcm8sIG5vbi11bmRlZmluZWQgbmF0dXJhbFdpZHRoXG4gIC8vIGZpeGVzIFNhZmFyaStJbmZpbml0ZVNjcm9sbCtNYXNvbnJ5IGJ1ZyBpbmZpbml0ZS1zY3JvbGwjNjcxXG4gIHJldHVybiB0aGlzLmltZy5jb21wbGV0ZSAmJiB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgbGV0IHsgcGFyZW50Tm9kZSB9ID0gdGhpcy5pbWc7XG4gIC8vIGVtaXQgcHJvZ3Jlc3Mgd2l0aCBwYXJlbnQgPHBpY3R1cmU+IG9yIHNlbGYgPGltZz5cbiAgbGV0IGVsZW0gPSBwYXJlbnROb2RlLm5vZGVOYW1lID09PSAnUElDVFVSRScgPyBwYXJlbnROb2RlIDogdGhpcy5pbWc7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIGVsZW0sIG1lc3NhZ2UgXSApO1xufTtcblxuLy8gLS0tLS0gZXZlbnRzIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXIgc3BlY2lmaWVkIGhhbmRsZXIgZm9yIGV2ZW50IHR5cGVcbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGxldCBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maXJtKCB0cnVlLCAnb25sb2FkJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggZmFsc2UsICdvbmVycm9yJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQmFja2dyb3VuZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBCYWNrZ3JvdW5kKCB1cmwsIGVsZW1lbnQgKSB7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xufVxuXG4vLyBpbmhlcml0IExvYWRpbmdJbWFnZSBwcm90b3R5cGVcbkJhY2tncm91bmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTG9hZGluZ0ltYWdlLnByb3RvdHlwZSApO1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gY2hlY2sgaWYgaW1hZ2UgaXMgYWxyZWFkeSBjb21wbGV0ZVxuICBsZXQgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICB0aGlzLmNvbmZpcm0oIHRoaXMuaW1nLm5hdHVyYWxXaWR0aCAhPT0gMCwgJ25hdHVyYWxXaWR0aCcgKTtcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xuICB9XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbkJhY2tncm91bmQucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgdGhpcy5lbGVtZW50LCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGpRdWVyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbiA9IGZ1bmN0aW9uKCBqUXVlcnkgKSB7XG4gIGpRdWVyeSA9IGpRdWVyeSB8fCB3aW5kb3cualF1ZXJ5O1xuICBpZiAoICFqUXVlcnkgKSByZXR1cm47XG5cbiAgLy8gc2V0IGxvY2FsIHZhcmlhYmxlXG4gICQgPSBqUXVlcnk7XG4gIC8vICQoKS5pbWFnZXNMb2FkZWQoKVxuICAkLmZuLmltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCBvcHRpb25zLCBvbkFsd2F5cyApIHtcbiAgICBsZXQgaW5zdGFuY2UgPSBuZXcgSW1hZ2VzTG9hZGVkKCB0aGlzLCBvcHRpb25zLCBvbkFsd2F5cyApO1xuICAgIHJldHVybiBpbnN0YW5jZS5qcURlZmVycmVkLnByb21pc2UoICQoIHRoaXMgKSApO1xuICB9O1xufTtcbi8vIHRyeSBtYWtpbmcgcGx1Z2luXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucmV0dXJuIEltYWdlc0xvYWRlZDtcblxufSApO1xuIiwiLyohXG4gKiBVbmlkcmFnZ2VyIHYzLjAuMVxuICogRHJhZ2dhYmxlIGJhc2UgY2xhc3NcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlVuaWRyYWdnZXIgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cbmZ1bmN0aW9uIFVuaWRyYWdnZXIoKSB7fVxuXG4vLyBpbmhlcml0IEV2RW1pdHRlclxubGV0IHByb3RvID0gVW5pZHJhZ2dlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tIGJpbmQgc3RhcnQgLS0tLS0gLy9cblxuLy8gdHJpZ2dlciBoYW5kbGVyIG1ldGhvZHMgZm9yIGV2ZW50c1xucHJvdG8uaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGxldCBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxubGV0IHN0YXJ0RXZlbnQsIGFjdGl2ZUV2ZW50cztcbmlmICggJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICkge1xuICAvLyBIQUNLIHByZWZlciBUb3VjaCBFdmVudHMgYXMgeW91IGNhbiBwcmV2ZW50RGVmYXVsdCBvbiB0b3VjaHN0YXJ0IHRvXG4gIC8vIGRpc2FibGUgc2Nyb2xsIGluIGlPUyAmIG1vYmlsZSBDaHJvbWUgbWV0YWZpenp5L2ZsaWNraXR5IzExNzdcbiAgc3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0JztcbiAgYWN0aXZlRXZlbnRzID0gWyAndG91Y2htb3ZlJywgJ3RvdWNoZW5kJywgJ3RvdWNoY2FuY2VsJyBdO1xufSBlbHNlIGlmICggd2luZG93LlBvaW50ZXJFdmVudCApIHtcbiAgLy8gUG9pbnRlciBFdmVudHNcbiAgc3RhcnRFdmVudCA9ICdwb2ludGVyZG93bic7XG4gIGFjdGl2ZUV2ZW50cyA9IFsgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVyY2FuY2VsJyBdO1xufSBlbHNlIHtcbiAgLy8gbW91c2UgZXZlbnRzXG4gIHN0YXJ0RXZlbnQgPSAnbW91c2Vkb3duJztcbiAgYWN0aXZlRXZlbnRzID0gWyAnbW91c2Vtb3ZlJywgJ21vdXNldXAnIF07XG59XG5cbi8vIHByb3RvdHlwZSBzbyBpdCBjYW4gYmUgb3ZlcndyaXRlYWJsZSBieSBGbGlja2l0eVxucHJvdG8udG91Y2hBY3Rpb25WYWx1ZSA9ICdub25lJztcblxucHJvdG8uYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoICdhZGRFdmVudExpc3RlbmVyJywgdGhpcy50b3VjaEFjdGlvblZhbHVlICk7XG59O1xuXG5wcm90by51bmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICcnICk7XG59O1xuXG4vKipcbiAqIEFkZCBvciByZW1vdmUgc3RhcnQgZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBiaW5kTWV0aG9kIC0gYWRkRXZlbnRMaXN0ZW5lciBvciByZW1vdmVFdmVudExpc3RlbmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdG91Y2hBY3Rpb24gLSB2YWx1ZSBmb3IgdG91Y2gtYWN0aW9uIENTUyBwcm9wZXJ0eVxuICovXG5wcm90by5fYmluZEhhbmRsZXMgPSBmdW5jdGlvbiggYmluZE1ldGhvZCwgdG91Y2hBY3Rpb24gKSB7XG4gIHRoaXMuaGFuZGxlcy5mb3JFYWNoKCAoIGhhbmRsZSApID0+IHtcbiAgICBoYW5kbGVbIGJpbmRNZXRob2QgXSggc3RhcnRFdmVudCwgdGhpcyApO1xuICAgIGhhbmRsZVsgYmluZE1ldGhvZCBdKCAnY2xpY2snLCB0aGlzICk7XG4gICAgLy8gdG91Y2gtYWN0aW9uOiBub25lIHRvIG92ZXJyaWRlIGJyb3dzZXIgdG91Y2ggZ2VzdHVyZXMuIG1ldGFmaXp6eS9mbGlja2l0eSM1NDBcbiAgICBpZiAoIHdpbmRvdy5Qb2ludGVyRXZlbnQgKSBoYW5kbGUuc3R5bGUudG91Y2hBY3Rpb24gPSB0b3VjaEFjdGlvbjtcbiAgfSApO1xufTtcblxucHJvdG8uYmluZEFjdGl2ZVBvaW50ZXJFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgYWN0aXZlRXZlbnRzLmZvckVhY2goICggZXZlbnROYW1lICkgPT4ge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIHRoaXMgKTtcbiAgfSApO1xufTtcblxucHJvdG8udW5iaW5kQWN0aXZlUG9pbnRlckV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICBhY3RpdmVFdmVudHMuZm9yRWFjaCggKCBldmVudE5hbWUgKSA9PiB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9ICk7XG59O1xuXG4vLyAtLS0tLSBldmVudCBoYW5kbGVyIGhlbHBlcnMgLS0tLS0gLy9cblxuLy8gdHJpZ2dlciBtZXRob2Qgd2l0aCBtYXRjaGluZyBwb2ludGVyXG5wcm90by53aXRoUG9pbnRlciA9IGZ1bmN0aW9uKCBtZXRob2ROYW1lLCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpc1sgbWV0aG9kTmFtZSBdKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxuLy8gdHJpZ2dlciBtZXRob2Qgd2l0aCBtYXRjaGluZyB0b3VjaFxucHJvdG8ud2l0aFRvdWNoID0gZnVuY3Rpb24oIG1ldGhvZE5hbWUsIGV2ZW50ICkge1xuICBsZXQgdG91Y2g7XG4gIGZvciAoIGxldCBjaGFuZ2VkVG91Y2ggb2YgZXZlbnQuY2hhbmdlZFRvdWNoZXMgKSB7XG4gICAgaWYgKCBjaGFuZ2VkVG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICAgIHRvdWNoID0gY2hhbmdlZFRvdWNoO1xuICAgIH1cbiAgfVxuICBpZiAoIHRvdWNoICkgdGhpc1sgbWV0aG9kTmFtZSBdKCBldmVudCwgdG91Y2ggKTtcbn07XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLnBvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5wb2ludGVyRG93biggZXZlbnQsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdICk7XG59O1xuXG5wcm90by5vbnBvaW50ZXJkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLnBvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbi8vIG5vZGVzIHRoYXQgaGF2ZSB0ZXh0IGZpZWxkc1xuY29uc3QgY3Vyc29yTm9kZXMgPSBbICdURVhUQVJFQScsICdJTlBVVCcsICdTRUxFQ1QnLCAnT1BUSU9OJyBdO1xuLy8gaW5wdXQgdHlwZXMgdGhhdCBkbyBub3QgaGF2ZSB0ZXh0IGZpZWxkc1xuY29uc3QgY2xpY2tUeXBlcyA9IFsgJ3JhZGlvJywgJ2NoZWNrYm94JywgJ2J1dHRvbicsICdzdWJtaXQnLCAnaW1hZ2UnLCAnZmlsZScgXTtcblxuLyoqXG4gKiBhbnkgdGltZSB5b3Ugc2V0IGBldmVudCwgcG9pbnRlcmAgaXQgcmVmZXJzIHRvOlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgfCBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZGlzbWlzcyBtdWx0aS10b3VjaCB0YXBzLCByaWdodCBjbGlja3MsIGFuZCBjbGlja3Mgb24gdGV4dCBmaWVsZHNcbiAgbGV0IGlzQ3Vyc29yTm9kZSA9IGN1cnNvck5vZGVzLmluY2x1ZGVzKCBldmVudC50YXJnZXQubm9kZU5hbWUgKTtcbiAgbGV0IGlzQ2xpY2tUeXBlID0gY2xpY2tUeXBlcy5pbmNsdWRlcyggZXZlbnQudGFyZ2V0LnR5cGUgKTtcbiAgbGV0IGlzT2theUVsZW1lbnQgPSAhaXNDdXJzb3JOb2RlIHx8IGlzQ2xpY2tUeXBlO1xuICBsZXQgaXNPa2F5ID0gIXRoaXMuaXNQb2ludGVyRG93biAmJiAhZXZlbnQuYnV0dG9uICYmIGlzT2theUVsZW1lbnQ7XG4gIGlmICggIWlzT2theSApIHJldHVybjtcblxuICB0aGlzLmlzUG9pbnRlckRvd24gPSB0cnVlO1xuICAvLyBzYXZlIHBvaW50ZXIgaWRlbnRpZmllciB0byBtYXRjaCB1cCB0b3VjaCBldmVudHNcbiAgdGhpcy5wb2ludGVySWRlbnRpZmllciA9IHBvaW50ZXIucG9pbnRlcklkICE9PSB1bmRlZmluZWQgP1xuICAgIC8vIHBvaW50ZXJJZCBmb3IgcG9pbnRlciBldmVudHMsIHRvdWNoLmluZGVudGlmaWVyIGZvciB0b3VjaCBldmVudHNcbiAgICBwb2ludGVyLnBvaW50ZXJJZCA6IHBvaW50ZXIuaWRlbnRpZmllcjtcbiAgLy8gdHJhY2sgcG9zaXRpb24gZm9yIG1vdmVcbiAgdGhpcy5wb2ludGVyRG93blBvaW50ZXIgPSB7XG4gICAgcGFnZVg6IHBvaW50ZXIucGFnZVgsXG4gICAgcGFnZVk6IHBvaW50ZXIucGFnZVksXG4gIH07XG5cbiAgdGhpcy5iaW5kQWN0aXZlUG9pbnRlckV2ZW50cygpO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJEb3duJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBtb3ZlIC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLnBvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMud2l0aFBvaW50ZXIoICdwb2ludGVyTW92ZScsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy53aXRoVG91Y2goICdwb2ludGVyTW92ZScsIGV2ZW50ICk7XG59O1xuXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgbGV0IG1vdmVWZWN0b3IgPSB7XG4gICAgeDogcG9pbnRlci5wYWdlWCAtIHRoaXMucG9pbnRlckRvd25Qb2ludGVyLnBhZ2VYLFxuICAgIHk6IHBvaW50ZXIucGFnZVkgLSB0aGlzLnBvaW50ZXJEb3duUG9pbnRlci5wYWdlWSxcbiAgfTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICAvLyBzdGFydCBkcmFnIGlmIHBvaW50ZXIgaGFzIG1vdmVkIGZhciBlbm91Z2ggdG8gc3RhcnQgZHJhZ1xuICBsZXQgaXNEcmFnU3RhcnRpbmcgPSAhdGhpcy5pc0RyYWdnaW5nICYmIHRoaXMuaGFzRHJhZ1N0YXJ0ZWQoIG1vdmVWZWN0b3IgKTtcbiAgaWYgKCBpc0RyYWdTdGFydGluZyApIHRoaXMuZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xuICBpZiAoIHRoaXMuaXNEcmFnZ2luZyApIHRoaXMuZHJhZ01vdmUoIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICk7XG59O1xuXG4vLyBjb25kaXRpb24gaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG5wcm90by5oYXNEcmFnU3RhcnRlZCA9IGZ1bmN0aW9uKCBtb3ZlVmVjdG9yICkge1xuICByZXR1cm4gTWF0aC5hYnMoIG1vdmVWZWN0b3IueCApID4gMyB8fCBNYXRoLmFicyggbW92ZVZlY3Rvci55ICkgPiAzO1xufTtcblxuLy8gLS0tLS0gZHJhZyAtLS0tLSAvL1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzID0gdHJ1ZTsgLy8gc2V0IGZsYWcgdG8gcHJldmVudCBjbGlja3NcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnU3RhcnQnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG4vLyAtLS0tLSBlbmQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZXVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLnBvaW50ZXJVcCggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnBvaW50ZXJ1cCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy53aXRoUG9pbnRlciggJ3BvaW50ZXJVcCcsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnRvdWNoZW5kID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLndpdGhUb3VjaCggJ3BvaW50ZXJVcCcsIGV2ZW50ICk7XG59O1xuXG5wcm90by5wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMucG9pbnRlckRvbmUoKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyVXAnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcblxuICBpZiAoIHRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICB0aGlzLmRyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcG9pbnRlciBkaWRuJ3QgbW92ZSBlbm91Z2ggZm9yIGRyYWcgdG8gc3RhcnRcbiAgICB0aGlzLnN0YXRpY0NsaWNrKCBldmVudCwgcG9pbnRlciApO1xuICB9XG59O1xuXG5wcm90by5kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmlzRHJhZ2dpbmcgPSBmYWxzZTsgLy8gcmVzZXQgZmxhZ1xuICAvLyByZS1lbmFibGUgY2xpY2tpbmcgYXN5bmNcbiAgc2V0VGltZW91dCggKCkgPT4gZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzICk7XG5cbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnRW5kJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyB0cmlnZ2VyZWQgb24gcG9pbnRlciB1cCAmIHBvaW50ZXIgY2FuY2VsXG5wcm90by5wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7XG4gIHRoaXMudW5iaW5kQWN0aXZlUG9pbnRlckV2ZW50cygpO1xuICB0aGlzLmVtaXRFdmVudCgncG9pbnRlckRvbmUnKTtcbn07XG5cbi8vIC0tLS0tIGNhbmNlbCAtLS0tLSAvL1xuXG5wcm90by5vbnBvaW50ZXJjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMud2l0aFBvaW50ZXIoICdwb2ludGVyQ2FuY2VsJywgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9udG91Y2hjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMud2l0aFRvdWNoKCAncG9pbnRlckNhbmNlbCcsIGV2ZW50ICk7XG59O1xuXG5wcm90by5wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLnBvaW50ZXJEb25lKCk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckNhbmNlbCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gY2xpY2sgLS0tLS0gLy9cblxuLy8gaGFuZGxlIGFsbCBjbGlja3MgYW5kIHByZXZlbnQgY2xpY2tzIHdoZW4gZHJhZ2dpbmdcbnByb3RvLm9uY2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggdGhpcy5pc1ByZXZlbnRpbmdDbGlja3MgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufTtcblxuLy8gdHJpZ2dlcmVkIGFmdGVyIHBvaW50ZXIgZG93biAmIHVwIHdpdGggbm8vdGlueSBtb3ZlbWVudFxucHJvdG8uc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGlnbm9yZSBlbXVsYXRlZCBtb3VzZSB1cCBjbGlja3NcbiAgbGV0IGlzTW91c2V1cCA9IGV2ZW50LnR5cGUgPT09ICdtb3VzZXVwJztcbiAgaWYgKCBpc01vdXNldXAgJiYgdGhpcy5pc0lnbm9yaW5nTW91c2VVcCApIHJldHVybjtcblxuICB0aGlzLmVtaXRFdmVudCggJ3N0YXRpY0NsaWNrJywgWyBldmVudCwgcG9pbnRlciBdICk7XG5cbiAgLy8gc2V0IGZsYWcgZm9yIGVtdWxhdGVkIGNsaWNrcyAzMDBtcyBhZnRlciB0b3VjaGVuZFxuICBpZiAoIGlzTW91c2V1cCApIHtcbiAgICB0aGlzLmlzSWdub3JpbmdNb3VzZVVwID0gdHJ1ZTtcbiAgICAvLyByZXNldCBmbGFnIGFmdGVyIDQwMG1zXG4gICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXA7XG4gICAgfSwgNDAwICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pZHJhZ2dlcjtcblxufSApICk7XG4iLCJjb25zdCBpY29uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpY29uXCIpO1xuaWNvbi5vbmNsaWNrID0gZnVuY3Rpb24gKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZShcImRhcmstdGhlbWVcIik7XG4gICAgaWYgKGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZGFyay10aGVtZVwiKSkge1xuICAgICAgICBpY29uLnNyYyA9IFwiaHR0cHM6Ly9wbHVzcG5nLmNvbS9pbWctcG5nL2JsYWNrLXN1bi1wbmctc3VuLWljb25zLTUxMi5wbmdcIlxuICAgIH0gZWxzZSB7XG4gICAgICAgIGljb24uc3JjID0gXCJodHRwczovL3d3dy5waW5jbGlwYXJ0LmNvbS9waWNkaXIvYmlnLzgyLTgyMDIzNV93aGl0ZS1jcmVzY2VudC1tb29uLWNsaXBhcnQtcG5nLWRvd25sb2FkLnBuZ1wiXG4gICAgfVxufSIsImNvbnN0IGhhbWJ1cmdlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdoYW1idXJnZXInKTtcbmhhbWJ1cmdlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgY29uc3QgdWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYgPiB1bCcpO1xuICAgIHVsLmNsYXNzTGlzdC50b2dnbGUoJ21lbnUtc2xpZGUnKTtcbiAgICBoYW1idXJnZXIuY2xhc3NMaXN0LnRvZ2dsZSgnY3Jvc3MnKTtcbn0pOyIsImltcG9ydCBGbGlja2l0eSBmcm9tIFwiZmxpY2tpdHlcIjtcblxudmFyIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbi1jYXJvdXNlbCcpO1xuaWYgKGVsZW0pIHtcbiAgICB2YXIgZmxrdHkgPSBuZXcgRmxpY2tpdHkoZWxlbSwge1xuICAgICAgICAvLyBvcHRpb25zXG4gICAgICAgIGNlbGxBbGlnbjogJ2xlZnQnLFxuICAgICAgICBjb250YWluOiB0cnVlLFxuICAgICAgICB3cmFwQXJvdW5kOiB0cnVlLFxuICAgICAgICBhdXRvUGxheTogMjUwMFxuICAgIH0pO1xufVxuXG4iLCJ3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcbiAgICByZXF1aXJlKFwiLi9tb2R1bGVzL19uYXZiYXIuanNcIik7XG4gICAgcmVxdWlyZShcIi4vbW9kdWxlcy9fc2xpZGVyLmpzXCIpO1xuICAgIHJlcXVpcmUoXCIuL21vZHVsZXMvX2Rhcmt0aGVtZS5qc1wiKTtcbn0pXG5cbiJdfQ==