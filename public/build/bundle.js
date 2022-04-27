
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root.host) {
            return root;
        }
        return document;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/Error.svelte generated by Svelte v3.42.3 */

    const { Error: Error_1$1 } = globals;
    const file$3 = "src/components/Error.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let p;
    	let t0;
    	let t1;
    	let t2;
    	let button;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("There was an error: ");
    			t1 = text(/*errorMessage*/ ctx[0]);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Try again";
    			add_location(p, file$3, 5, 2, 55);
    			attr_dev(button, "onclick", "window.location.reload();");
    			add_location(button, file$3, 7, 2, 100);
    			add_location(div, file$3, 4, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(div, t2);
    			append_dev(div, button);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errorMessage*/ 1) set_data_dev(t1, /*errorMessage*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Error', slots, []);
    	let { errorMessage } = $$props;
    	const writable_props = ['errorMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    	};

    	$$self.$capture_state = () => ({ errorMessage });

    	$$self.$inject_state = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errorMessage];
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { errorMessage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Error",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*errorMessage*/ ctx[0] === undefined && !('errorMessage' in props)) {
    			console.warn("<Error> was created without expected prop 'errorMessage'");
    		}
    	}

    	get errorMessage() {
    		throw new Error_1$1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessage(value) {
    		throw new Error_1$1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const ERROR_MESSAGES = {
        NODE_FETCHING_ERROR:"Something went wrong fetching the network info. Please, try again later.",
        TOO_MANY_REQUESTS:"Too many requests. Please, try again later.",
        SENDING_REQUEST:"Sending request...",
        OK:"OK"
    };

    const IOTA_BENCH32HRP = "atoi";
    const IOTA_TOKEN_NAME = "IOTA";
    const SHIMMER_BENCH32HRP = "rms";
    const SHIMMER_TOKEN_NAME = "Shimmer";

    const KNOWN_NETWORK_PARAMS = [
      {
        tokenName: IOTA_TOKEN_NAME,
        bech32HRP: IOTA_BENCH32HRP,
        logo: "iota.svg",
        favicon: "iota-fav.ico",
      },
      {
        tokenName: SHIMMER_TOKEN_NAME,
        bech32HRP: SHIMMER_BENCH32HRP,
        logo: "shimmer.svg",
        favicon: "shimmer-fav.ico",
      },
    ];

    /* src/components/Faucet.svelte generated by Svelte v3.42.3 */
    const file$2 = "src/components/Faucet.svelte";

    // (69:2) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	function select_block_type_2(ctx, dirty) {
    		if (/*isWaiting*/ ctx[3]) return create_if_block_2$1;
    		if (/*valid*/ ctx[7]) return create_if_block_3$1;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "warning svelte-1ueoti6");
    			add_location(div, file$2, 69, 4, 1636);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(69:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (61:2) {#if isDone}
    function create_if_block$1(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*hasSucceeded*/ ctx[5]) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "warning svelte-1ueoti6");
    			add_location(div, file$2, 61, 4, 1443);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(61:2) {#if isDone}",
    		ctx
    	});

    	return block;
    }

    // (75:6) {:else}
    function create_else_block_2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Please enter a valid ");
    			t1 = text(/*tokenName*/ ctx[0]);
    			t2 = text(" address (");
    			t3 = text(/*bech32HRP*/ ctx[1]);
    			t4 = text("1...)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tokenName*/ 1) set_data_dev(t1, /*tokenName*/ ctx[0]);
    			if (dirty & /*bech32HRP*/ 2) set_data_dev(t3, /*bech32HRP*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(t4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(75:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:22) 
    function create_if_block_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Click the request button to receive your coins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(73:22) ",
    		ctx
    	});

    	return block;
    }

    // (71:6) {#if isWaiting}
    function create_if_block_2$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(71:6) {#if isWaiting}",
    		ctx
    	});

    	return block;
    }

    // (65:6) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errorMessage*/ ctx[6]);
    			add_location(div, file$2, 65, 8, 1573);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 64) set_data_dev(t, /*errorMessage*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(65:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:6) {#if hasSucceeded}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*tokenName*/ ctx[0]);
    			t1 = text(" will be sent to your address!");
    			add_location(div, file$2, 63, 8, 1498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tokenName*/ 1) set_data_dev(t0, /*tokenName*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(63:6) {#if hasSucceeded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let p0;
    	let t1;
    	let h1;
    	let t2;
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let t7;
    	let t8;
    	let t9;
    	let div0;
    	let label;
    	let t10;
    	let t11;
    	let t12;
    	let input;
    	let t13;
    	let div1;
    	let button;
    	let t14;
    	let button_disabled_value;
    	let t15;
    	let div2;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*isDone*/ ctx[4]) return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			p0 = element("p");
    			p0.textContent = "Welcome to";
    			t1 = space();
    			h1 = element("h1");
    			t2 = text(/*tokenName*/ ctx[0]);
    			t3 = text(" Faucet");
    			t4 = space();
    			p1 = element("p");
    			t5 = text("This service distributes tokens to the requested ");
    			t6 = text(/*tokenName*/ ctx[0]);
    			t7 = text(" address.");
    			t8 = space();
    			if_block.c();
    			t9 = space();
    			div0 = element("div");
    			label = element("label");
    			t10 = text(/*tokenName*/ ctx[0]);
    			t11 = text(" Address");
    			t12 = space();
    			input = element("input");
    			t13 = space();
    			div1 = element("div");
    			button = element("button");
    			t14 = text("Request");
    			t15 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(p0, "class", "welcome svelte-1ueoti6");
    			add_location(p0, file$2, 55, 2, 1260);
    			add_location(h1, file$2, 56, 2, 1296);
    			attr_dev(p1, "class", "help svelte-1ueoti6");
    			add_location(p1, file$2, 57, 2, 1326);
    			attr_dev(label, "for", "address");
    			attr_dev(label, "class", "svelte-1ueoti6");
    			add_location(label, file$2, 80, 4, 1924);
    			attr_dev(input, "type", "text");
    			input.disabled = /*isWaiting*/ ctx[3];
    			attr_dev(input, "class", "svelte-1ueoti6");
    			add_location(input, file$2, 81, 4, 1977);
    			attr_dev(div0, "class", "iota-input svelte-1ueoti6");
    			add_location(div0, file$2, 79, 2, 1895);
    			attr_dev(button, "type", "button");
    			button.disabled = button_disabled_value = /*isWaiting*/ ctx[3] || !/*valid*/ ctx[7];
    			attr_dev(button, "class", "svelte-1ueoti6");
    			add_location(button, file$2, 84, 4, 2076);
    			attr_dev(div1, "class", "right svelte-1ueoti6");
    			add_location(div1, file$2, 83, 2, 2052);
    			if (!src_url_equal(img.src, img_src_value = "./illustration.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "faucet");
    			attr_dev(img, "class", "illustration svelte-1ueoti6");
    			add_location(img, file$2, 89, 4, 2235);
    			attr_dev(div2, "class", "illustration-container svelte-1ueoti6");
    			add_location(div2, file$2, 88, 2, 2194);
    			add_location(div3, file$2, 54, 0, 1252);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, p0);
    			append_dev(div3, t1);
    			append_dev(div3, h1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(div3, t4);
    			append_dev(div3, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(div3, t8);
    			if_block.m(div3, null);
    			append_dev(div3, t9);
    			append_dev(div3, div0);
    			append_dev(div0, label);
    			append_dev(label, t10);
    			append_dev(label, t11);
    			append_dev(div0, t12);
    			append_dev(div0, input);
    			set_input_value(input, /*address*/ ctx[2]);
    			append_dev(div3, t13);
    			append_dev(div3, div1);
    			append_dev(div1, button);
    			append_dev(button, t14);
    			append_dev(div3, t15);
    			append_dev(div3, div2);
    			append_dev(div2, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[9]),
    					listen_dev(button, "click", /*requestTokens*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tokenName*/ 1) set_data_dev(t2, /*tokenName*/ ctx[0]);
    			if (dirty & /*tokenName*/ 1) set_data_dev(t6, /*tokenName*/ ctx[0]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div3, t9);
    				}
    			}

    			if (dirty & /*tokenName*/ 1) set_data_dev(t10, /*tokenName*/ ctx[0]);

    			if (dirty & /*isWaiting*/ 8) {
    				prop_dev(input, "disabled", /*isWaiting*/ ctx[3]);
    			}

    			if (dirty & /*address*/ 4 && input.value !== /*address*/ ctx[2]) {
    				set_input_value(input, /*address*/ ctx[2]);
    			}

    			if (dirty & /*isWaiting, valid*/ 136 && button_disabled_value !== (button_disabled_value = /*isWaiting*/ ctx[3] || !/*valid*/ ctx[7])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let valid;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Faucet', slots, []);
    	let { tokenName = "" } = $$props;
    	let { bech32HRP = "" } = $$props;
    	let isWaiting = false;
    	let isDone = false;
    	let address = null;
    	let hasSucceeded = false;
    	let errorMessage = null;

    	async function requestTokens() {
    		if (isWaiting) {
    			return false;
    		}

    		$$invalidate(3, isWaiting = true);
    		let response = null;
    		let data = null;
    		$$invalidate(6, errorMessage = ERROR_MESSAGES.SENDING_REQUEST);

    		try {
    			const FAUCET_ENDPOINT = "/api/enqueue";

    			response = await fetch(FAUCET_ENDPOINT, {
    				method: "POST",
    				body: JSON.stringify({ address })
    			});

    			if (response.status === 202) {
    				$$invalidate(6, errorMessage = ERROR_MESSAGES.OK);
    			} else if (response.status === 429) {
    				$$invalidate(6, errorMessage = ERROR_MESSAGES.TOO_MANY_REQUESTS);
    			} else {
    				data = await response.json();
    				$$invalidate(6, errorMessage = data.error.message);
    			}
    		} catch(error) {
    			if (error.name === "AbortError") {
    				timeout = true;
    			}

    			$$invalidate(6, errorMessage = error);
    		}

    		$$invalidate(5, hasSucceeded = response && response.status === 202);
    		$$invalidate(4, isDone = true);
    		$$invalidate(3, isWaiting = false);
    		$$invalidate(2, address = "");
    	}

    	const writable_props = ['tokenName', 'bech32HRP'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Faucet> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		address = this.value;
    		$$invalidate(2, address);
    	}

    	$$self.$$set = $$props => {
    		if ('tokenName' in $$props) $$invalidate(0, tokenName = $$props.tokenName);
    		if ('bech32HRP' in $$props) $$invalidate(1, bech32HRP = $$props.bech32HRP);
    	};

    	$$self.$capture_state = () => ({
    		ERROR_MESSAGES,
    		tokenName,
    		bech32HRP,
    		isWaiting,
    		isDone,
    		address,
    		hasSucceeded,
    		errorMessage,
    		requestTokens,
    		valid
    	});

    	$$self.$inject_state = $$props => {
    		if ('tokenName' in $$props) $$invalidate(0, tokenName = $$props.tokenName);
    		if ('bech32HRP' in $$props) $$invalidate(1, bech32HRP = $$props.bech32HRP);
    		if ('isWaiting' in $$props) $$invalidate(3, isWaiting = $$props.isWaiting);
    		if ('isDone' in $$props) $$invalidate(4, isDone = $$props.isDone);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    		if ('hasSucceeded' in $$props) $$invalidate(5, hasSucceeded = $$props.hasSucceeded);
    		if ('errorMessage' in $$props) $$invalidate(6, errorMessage = $$props.errorMessage);
    		if ('valid' in $$props) $$invalidate(7, valid = $$props.valid);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*address*/ 4) {
    			$$invalidate(7, valid = address && address.length > 0);
    		}
    	};

    	return [
    		tokenName,
    		bech32HRP,
    		address,
    		isWaiting,
    		isDone,
    		hasSucceeded,
    		errorMessage,
    		valid,
    		requestTokens,
    		input_input_handler
    	];
    }

    class Faucet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { tokenName: 0, bech32HRP: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Faucet",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get tokenName() {
    		throw new Error("<Faucet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tokenName(value) {
    		throw new Error("<Faucet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bech32HRP() {
    		throw new Error("<Faucet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bech32HRP(value) {
    		throw new Error("<Faucet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Loader.svelte generated by Svelte v3.42.3 */

    const file$1 = "src/components/Loader.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let p;
    	let t1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Fetching network from node...";
    			t1 = space();
    			div0 = element("div");
    			add_location(p, file$1, 1, 2, 8);
    			attr_dev(div0, "class", "spinner svelte-1ftg3rg");
    			add_location(div0, file$1, 2, 2, 47);
    			attr_dev(div1, "class", "svelte-1ftg3rg");
    			add_location(div1, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Loader', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.42.3 */

    const { Error: Error_1, console: console_1, document: document_1 } = globals;

    const file = "src/App.svelte";

    // (76:2) {#if favicon}
    function create_if_block_3(ctx) {
    	let link;

    	const block = {
    		c: function create() {
    			link = element("link");
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", /*favicon*/ ctx[3]);
    			add_location(link, file, 76, 4, 2518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*favicon*/ 8) {
    				attr_dev(link, "href", /*favicon*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(76:2) {#if favicon}",
    		ctx
    	});

    	return block;
    }

    // (85:8) {#if logo}
    function create_if_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*logo*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "logo svelte-1tgim9i");
    			attr_dev(img, "alt", /*tokenName*/ ctx[0]);
    			add_location(img, file, 85, 10, 2705);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*logo*/ 16 && !src_url_equal(img.src, img_src_value = /*logo*/ ctx[4])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*tokenName*/ 1) {
    				attr_dev(img, "alt", /*tokenName*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(85:8) {#if logo}",
    		ctx
    	});

    	return block;
    }

    // (101:10) {:else}
    function create_else_block(ctx) {
    	let div;
    	let loader;
    	let div_intro;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(loader.$$.fragment);
    			add_location(div, file, 101, 12, 3149);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(loader, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(loader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(101:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (97:43) 
    function create_if_block_1(ctx) {
    	let div;
    	let faucet;
    	let div_intro;
    	let current;

    	faucet = new Faucet({
    			props: {
    				bech32HRP: /*bech32HRP*/ ctx[2],
    				tokenName: /*tokenName*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(faucet.$$.fragment);
    			add_location(div, file, 97, 12, 3037);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(faucet, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const faucet_changes = {};
    			if (dirty & /*bech32HRP*/ 4) faucet_changes.bech32HRP = /*bech32HRP*/ ctx[2];
    			if (dirty & /*tokenName*/ 1) faucet_changes.tokenName = /*tokenName*/ ctx[0];
    			faucet.$set(faucet_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(faucet.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(faucet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(faucet);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(97:43) ",
    		ctx
    	});

    	return block;
    }

    // (93:10) {#if errorMessage}
    function create_if_block(ctx) {
    	let div;
    	let error;
    	let div_intro;
    	let current;

    	error = new Error$1({
    			props: { errorMessage: /*errorMessage*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(error.$$.fragment);
    			add_location(div, file, 93, 12, 2909);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(error, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const error_changes = {};
    			if (dirty & /*errorMessage*/ 2) error_changes.errorMessage = /*errorMessage*/ ctx[1];
    			error.$set(error_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(error.$$.fragment, local);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, {});
    					div_intro.start();
    				});
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(error.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(error);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(93:10) {#if errorMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let if_block0_anchor;
    	let t0;
    	let div5;
    	let div4;
    	let div1;
    	let div0;
    	let t1;
    	let div3;
    	let div2;
    	let main;
    	let current_block_type_index;
    	let if_block2;
    	let current;
    	document_1.title = title_value = "" + ((/*tokenName*/ ctx[0] ? `${/*tokenName*/ ctx[0]} ` : "") + "Faucet");
    	let if_block0 = /*favicon*/ ctx[3] && create_if_block_3(ctx);
    	let if_block1 = /*logo*/ ctx[4] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*errorMessage*/ ctx[1]) return 0;
    		if (/*tokenName*/ ctx[0] && /*bech32HRP*/ ctx[2]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			t0 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			main = element("main");
    			if_block2.c();
    			attr_dev(div0, "class", "col-xs-12");
    			add_location(div0, file, 83, 6, 2652);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file, 82, 4, 2628);
    			attr_dev(main, "class", "svelte-1tgim9i");
    			add_location(main, file, 91, 8, 2861);
    			attr_dev(div2, "class", "col-lg-4");
    			add_location(div2, file, 90, 6, 2830);
    			attr_dev(div3, "class", "row contentrow");
    			add_location(div3, file, 89, 4, 2795);
    			attr_dev(div4, "class", "content");
    			add_location(div4, file, 81, 2, 2602);
    			add_location(div5, file, 80, 0, 2594);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(document_1.head, null);
    			append_dev(document_1.head, if_block0_anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, main);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*tokenName*/ 1) && title_value !== (title_value = "" + ((/*tokenName*/ ctx[0] ? `${/*tokenName*/ ctx[0]} ` : "") + "Faucet"))) {
    				document_1.title = title_value;
    			}

    			if (/*favicon*/ ctx[3]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*logo*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				} else {
    					if_block2.p(ctx, dirty);
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div5);
    			if (if_block1) if_block1.d();
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let detectedNetworkDefaultParams;
    	let logo;
    	let favicon;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let errorMessage = null;
    	let tokenName = null;
    	let bech32HRP = null;

    	onMount(() => {
    		void getNetwork();
    	});

    	const getNetwork = async () => {
    		const NODE_ENDPOINT = "/api/info";

    		try {
    			const res = await fetch(NODE_ENDPOINT);

    			if (res.status === 200 || res.status === 202) {
    				const response = await res.json();

    				if (response) {
    					const data = response.data ? response.data : response;
    					return setNetworkData(data);
    				}

    				return $$invalidate(1, errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR);
    			} else if (res.status === 429) {
    				return $$invalidate(1, errorMessage = ERROR_MESSAGES.TOO_MANY_REQUESTS);
    			} else {
    				return $$invalidate(1, errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR);
    			}
    		} catch(error) {
    			console.error(error);
    			$$invalidate(1, errorMessage = error);
    		}
    	};

    	const setNetworkData = (data = {}) => {
    		if (data.address) {
    			if (data.address.startsWith(IOTA_BENCH32HRP)) {
    				$$invalidate(0, tokenName = data.tokenName ? data.tokenName : IOTA_TOKEN_NAME);
    				$$invalidate(2, bech32HRP = data.bech32HRP ? data.bech32HRP : IOTA_BENCH32HRP);
    				document.body.classList.add("iota");
    			} else if (data.address.startsWith(SHIMMER_BENCH32HRP)) {
    				$$invalidate(0, tokenName = data.tokenName ? data.tokenName : SHIMMER_TOKEN_NAME);
    				$$invalidate(2, bech32HRP = data.bech32HRP ? data.bech32HRP : SHIMMER_BENCH32HRP);
    				document.body.classList.add("shimmer");
    			} else {
    				$$invalidate(0, tokenName = data.tokenName ? data.tokenName : "Foo Bar");
    				$$invalidate(2, bech32HRP = data.bech32HRP ? data.bech32HRP : "foo1");
    			}
    		} else {
    			$$invalidate(1, errorMessage = ERROR_MESSAGES.NODE_FETCHING_ERROR);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		fade,
    		Error: Error$1,
    		Faucet,
    		Loader,
    		IOTA_BENCH32HRP,
    		IOTA_TOKEN_NAME,
    		SHIMMER_BENCH32HRP,
    		SHIMMER_TOKEN_NAME,
    		KNOWN_NETWORK_PARAMS,
    		ERROR_MESSAGES,
    		errorMessage,
    		tokenName,
    		bech32HRP,
    		getNetwork,
    		setNetworkData,
    		detectedNetworkDefaultParams,
    		favicon,
    		logo
    	});

    	$$self.$inject_state = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(1, errorMessage = $$props.errorMessage);
    		if ('tokenName' in $$props) $$invalidate(0, tokenName = $$props.tokenName);
    		if ('bech32HRP' in $$props) $$invalidate(2, bech32HRP = $$props.bech32HRP);
    		if ('detectedNetworkDefaultParams' in $$props) $$invalidate(5, detectedNetworkDefaultParams = $$props.detectedNetworkDefaultParams);
    		if ('favicon' in $$props) $$invalidate(3, favicon = $$props.favicon);
    		if ('logo' in $$props) $$invalidate(4, logo = $$props.logo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*tokenName*/ 1) {
    			$$invalidate(5, detectedNetworkDefaultParams = KNOWN_NETWORK_PARAMS.find(networkParams => {
    				if (tokenName) tokenName.toLowerCase() === networkParams.tokenName.toLowerCase();
    			}));
    		}

    		if ($$self.$$.dirty & /*detectedNetworkDefaultParams*/ 32) {
    			$$invalidate(4, logo = detectedNetworkDefaultParams && detectedNetworkDefaultParams.logo
    			? detectedNetworkDefaultParams.logo
    			: null);
    		}

    		if ($$self.$$.dirty & /*detectedNetworkDefaultParams*/ 32) {
    			$$invalidate(3, favicon = detectedNetworkDefaultParams && detectedNetworkDefaultParams.favicon
    			? detectedNetworkDefaultParams.favicon
    			: null);
    		}
    	};

    	return [
    		tokenName,
    		errorMessage,
    		bech32HRP,
    		favicon,
    		logo,
    		detectedNetworkDefaultParams
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById('app')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
