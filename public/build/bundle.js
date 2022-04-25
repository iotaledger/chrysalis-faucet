
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function append(target, node) {
        target.appendChild(node);
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
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
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

    /* src/components/Page.svelte generated by Svelte v3.42.3 */

    const file$3 = "src/components/Page.svelte";

    // (83:4) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	function select_block_type_2(ctx, dirty) {
    		if (/*waiting*/ ctx[0]) return create_if_block_2;
    		if (/*valid*/ ctx[1]) return create_if_block_3;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "warning svelte-1fszyfy");
    			add_location(div, file$3, 83, 8, 2125);
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
    		source: "(83:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:4) {#if done}
    function create_if_block$1(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*success*/ ctx[4]) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "warning svelte-1fszyfy");
    			add_location(div, file$3, 75, 8, 1901);
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
    		source: "(75:4) {#if done}",
    		ctx
    	});

    	return block;
    }

    // (89:12) {:else}
    function create_else_block_2(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;

    	const block = {
    		c: function create() {
    			t0 = text("Please enter a valid ");
    			t1 = text(/*token*/ ctx[7]);
    			t2 = text(" address (");
    			t3 = text(/*hint*/ ctx[6]);
    			t4 = text(")");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, t4, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*token*/ 128) set_data_dev(t1, /*token*/ ctx[7]);
    			if (dirty & /*hint*/ 64) set_data_dev(t3, /*hint*/ ctx[6]);
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
    		source: "(89:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:28) 
    function create_if_block_3(ctx) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(87:28) ",
    		ctx
    	});

    	return block;
    }

    // (85:12) {#if waiting}
    function create_if_block_2(ctx) {
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(85:12) {#if waiting}",
    		ctx
    	});

    	return block;
    }

    // (79:12) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*errormsg*/ ctx[5]);
    			add_location(div, file$3, 79, 16, 2050);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errormsg*/ 32) set_data_dev(t, /*errormsg*/ ctx[5]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(79:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (77:12) {#if success}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*token*/ ctx[7]);
    			t1 = text(" will be sent to your address!");
    			add_location(div, file$3, 77, 16, 1965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*token*/ 128) set_data_dev(t0, /*token*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(77:12) {#if success}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let main;
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
    	let t15;
    	let div2;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*done*/ ctx[2]) return create_if_block$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			p0 = element("p");
    			p0.textContent = "Welcome to";
    			t1 = space();
    			h1 = element("h1");
    			t2 = text(/*token*/ ctx[7]);
    			t3 = text(" Faucet");
    			t4 = space();
    			p1 = element("p");
    			t5 = text("This service distributes tokens to the requested ");
    			t6 = text(/*token*/ ctx[7]);
    			t7 = text(" address.");
    			t8 = space();
    			if_block.c();
    			t9 = space();
    			div0 = element("div");
    			label = element("label");
    			t10 = text(/*token*/ ctx[7]);
    			t11 = text(" Address");
    			t12 = space();
    			input = element("input");
    			t13 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Request";
    			t15 = space();
    			div2 = element("div");
    			img = element("img");
    			attr_dev(p0, "class", "welcome svelte-1fszyfy");
    			add_location(p0, file$3, 69, 4, 1712);
    			attr_dev(h1, "class", "svelte-1fszyfy");
    			add_location(h1, file$3, 70, 4, 1750);
    			attr_dev(p1, "class", "help svelte-1fszyfy");
    			add_location(p1, file$3, 71, 4, 1778);
    			attr_dev(label, "for", "address");
    			attr_dev(label, "class", "svelte-1fszyfy");
    			add_location(label, file$3, 94, 8, 2458);
    			attr_dev(input, "type", "text");
    			input.disabled = /*waiting*/ ctx[0];
    			attr_dev(input, "class", "svelte-1fszyfy");
    			add_location(input, file$3, 95, 8, 2511);
    			attr_dev(div0, "class", "iota-input svelte-1fszyfy");
    			add_location(div0, file$3, 93, 4, 2425);
    			attr_dev(button, "type", "button");
    			toggle_class(button, "disabled", /*waiting*/ ctx[0] || !/*valid*/ ctx[1]);
    			add_location(button, file$3, 103, 8, 2692);
    			attr_dev(div1, "class", "right svelte-1fszyfy");
    			add_location(div1, file$3, 102, 4, 2664);
    			if (!src_url_equal(img.src, img_src_value = "./illustration.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "faucet");
    			attr_dev(img, "class", "illustration");
    			add_location(img, file$3, 112, 8, 2918);
    			attr_dev(div2, "class", "illustration-container");
    			add_location(div2, file$3, 111, 4, 2873);
    			attr_dev(main, "class", "svelte-1fszyfy");
    			add_location(main, file$3, 68, 0, 1701);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p0);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			append_dev(main, t4);
    			append_dev(main, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(p1, t7);
    			append_dev(main, t8);
    			if_block.m(main, null);
    			append_dev(main, t9);
    			append_dev(main, div0);
    			append_dev(div0, label);
    			append_dev(label, t10);
    			append_dev(label, t11);
    			append_dev(div0, t12);
    			append_dev(div0, input);
    			set_input_value(input, /*address*/ ctx[3]);
    			append_dev(main, t13);
    			append_dev(main, div1);
    			append_dev(div1, button);
    			append_dev(main, t15);
    			append_dev(main, div2);
    			append_dev(div2, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[11]),
    					listen_dev(input, "keyup", /*validate*/ ctx[8], false, false, false),
    					listen_dev(button, "click", /*requestTokens*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*token*/ 128) set_data_dev(t2, /*token*/ ctx[7]);
    			if (dirty & /*token*/ 128) set_data_dev(t6, /*token*/ ctx[7]);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t9);
    				}
    			}

    			if (dirty & /*token*/ 128) set_data_dev(t10, /*token*/ ctx[7]);

    			if (dirty & /*waiting*/ 1) {
    				prop_dev(input, "disabled", /*waiting*/ ctx[0]);
    			}

    			if (dirty & /*address*/ 8 && input.value !== /*address*/ ctx[3]) {
    				set_input_value(input, /*address*/ ctx[3]);
    			}

    			if (dirty & /*waiting, valid*/ 3) {
    				toggle_class(button, "disabled", /*waiting*/ ctx[0] || !/*valid*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
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
    	let token;
    	let hint;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	let { networkParams } = $$props;
    	let waiting = false;
    	let valid = false;
    	let done = false;
    	let timeout = false;
    	let address = "";
    	let success = false;
    	let data = null;
    	let errormsg = null;

    	function validate() {
    		$$invalidate(2, done = false);

    		if (address.length >= 0) {
    			$$invalidate(1, valid = true);
    		} else {
    			$$invalidate(1, valid = false);
    			return false;
    		}
    	}

    	async function requestTokens() {
    		if (!validate()) return;

    		if (waiting) {
    			return false;
    		}

    		$$invalidate(0, waiting = true);
    		let res = null;
    		data = null;
    		$$invalidate(5, errormsg = "Sending request...");

    		try {
    			res = await fetch(`/api/enqueue`, {
    				method: "POST",
    				headers: {
    					Accept: "application/json",
    					"Content-Type": "application/json"
    				},
    				body: JSON.stringify({ address })
    			});

    			if (res.status === 202) {
    				data = await res.json();
    				$$invalidate(5, errormsg = "OK");
    			} else if (res.status === 429) {
    				$$invalidate(5, errormsg = "Too many requests. Try again later!");
    			} else {
    				data = await res.json();
    				$$invalidate(5, errormsg = data.error.message);
    			}
    		} catch(error) {
    			if (error.name === "AbortError") {
    				timeout = true;
    			}

    			$$invalidate(5, errormsg = error);
    		}

    		$$invalidate(4, success = res && res.status === 202);
    		$$invalidate(2, done = true);
    		$$invalidate(0, waiting = false);
    		$$invalidate(3, address = "");
    	}

    	const writable_props = ['networkParams'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		address = this.value;
    		$$invalidate(3, address);
    	}

    	$$self.$$set = $$props => {
    		if ('networkParams' in $$props) $$invalidate(10, networkParams = $$props.networkParams);
    	};

    	$$self.$capture_state = () => ({
    		networkParams,
    		waiting,
    		valid,
    		done,
    		timeout,
    		address,
    		success,
    		data,
    		errormsg,
    		validate,
    		requestTokens,
    		hint,
    		token
    	});

    	$$self.$inject_state = $$props => {
    		if ('networkParams' in $$props) $$invalidate(10, networkParams = $$props.networkParams);
    		if ('waiting' in $$props) $$invalidate(0, waiting = $$props.waiting);
    		if ('valid' in $$props) $$invalidate(1, valid = $$props.valid);
    		if ('done' in $$props) $$invalidate(2, done = $$props.done);
    		if ('timeout' in $$props) timeout = $$props.timeout;
    		if ('address' in $$props) $$invalidate(3, address = $$props.address);
    		if ('success' in $$props) $$invalidate(4, success = $$props.success);
    		if ('data' in $$props) data = $$props.data;
    		if ('errormsg' in $$props) $$invalidate(5, errormsg = $$props.errormsg);
    		if ('hint' in $$props) $$invalidate(6, hint = $$props.hint);
    		if ('token' in $$props) $$invalidate(7, token = $$props.token);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*networkParams*/ 1024) {
    			$$invalidate(7, { token, hint } = networkParams, token, ($$invalidate(6, hint), $$invalidate(10, networkParams)));
    		}
    	};

    	return [
    		waiting,
    		valid,
    		done,
    		address,
    		success,
    		errormsg,
    		hint,
    		token,
    		validate,
    		requestTokens,
    		networkParams,
    		input_input_handler
    	];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { networkParams: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*networkParams*/ ctx[10] === undefined && !('networkParams' in props)) {
    			console.warn("<Page> was created without expected prop 'networkParams'");
    		}
    	}

    	get networkParams() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set networkParams(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Loader.svelte generated by Svelte v3.42.3 */

    const file$2 = "src/components/Loader.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let div;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Waiting";
    			t1 = space();
    			div = element("div");
    			add_location(h1, file$2, 4, 4, 31);
    			attr_dev(div, "class", "spinner svelte-1sqenb0");
    			add_location(div, file$2, 5, 4, 52);
    			attr_dev(main, "class", "svelte-1sqenb0");
    			add_location(main, file$2, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$2($$self, $$props) {
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ErrorPage.svelte generated by Svelte v3.42.3 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ErrorPage.svelte";

    function create_fragment$1(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let p;
    	let t1;
    	let t2;
    	let button;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text("There was an error:\n        ");
    			p = element("p");
    			t1 = text(/*errorMessage*/ ctx[0]);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Try again";
    			add_location(p, file$1, 8, 8, 132);
    			add_location(h1, file$1, 6, 4, 91);
    			attr_dev(button, "onclick", "window.location.reload();");
    			add_location(button, file$1, 13, 4, 191);
    			attr_dev(main, "class", "svelte-fcn7gt");
    			add_location(main, file$1, 5, 0, 80);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(h1, p);
    			append_dev(p, t1);
    			append_dev(main, t2);
    			append_dev(main, button);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*errorMessage*/ 1) set_data_dev(t1, /*errorMessage*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ErrorPage', slots, []);
    	let { errorMessage } = $$props;
    	console.log(errorMessage);
    	const writable_props = ['errorMessage'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ErrorPage> was created with unknown prop '${key}'`);
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

    class ErrorPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { errorMessage: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ErrorPage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*errorMessage*/ ctx[0] === undefined && !('errorMessage' in props)) {
    			console_1.warn("<ErrorPage> was created without expected prop 'errorMessage'");
    		}
    	}

    	get errorMessage() {
    		throw new Error("<ErrorPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errorMessage(value) {
    		throw new Error("<ErrorPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
      }

    /* src/App.svelte generated by Svelte v3.42.3 */

    const { document: document_1 } = globals;
    const file = "src/App.svelte";

    // (115:16) {:else}
    function create_else_block(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(115:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (113:34) 
    function create_if_block_1(ctx) {
    	let page;
    	let current;

    	page = new Page({
    			props: {
    				networkParams: /*networkParams*/ ctx[3][/*network*/ ctx[1]]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(page.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(page, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const page_changes = {};
    			if (dirty & /*network*/ 2) page_changes.networkParams = /*networkParams*/ ctx[3][/*network*/ ctx[1]];
    			page.$set(page_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(page, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(113:34) ",
    		ctx
    	});

    	return block;
    }

    // (111:16) {#if errorMessage}
    function create_if_block(ctx) {
    	let errorpage;
    	let current;

    	errorpage = new ErrorPage({
    			props: { errorMessage: /*errorMessage*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(errorpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(errorpage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const errorpage_changes = {};
    			if (dirty & /*errorMessage*/ 1) errorpage_changes.errorMessage = /*errorMessage*/ ctx[0];
    			errorpage.$set(errorpage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(errorpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(errorpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(111:16) {#if errorMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let title_value;
    	let link;
    	let t0;
    	let main;
    	let div4;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div3;
    	let div2;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	document_1.title = title_value = "" + (capitalize(/*network*/ ctx[1] || "iota") + " Faucet");
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*errorMessage*/ ctx[0]) return 0;
    		if (/*network*/ ctx[1]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t1 = space();
    			div3 = element("div");
    			div2 = element("div");
    			if_block.c();
    			attr_dev(link, "rel", "icon");
    			attr_dev(link, "type", "image/png");
    			attr_dev(link, "href", /*networkIco*/ ctx[2]);
    			add_location(link, file, 90, 4, 2578);

    			if (!src_url_equal(img.src, img_src_value = `./${/*network*/ ctx[1] == "iota" || /*network*/ ctx[1] == "shimmer"
			? /*network*/ ctx[1]
			: "iota"}.svg`)) attr_dev(img, "src", img_src_value);

    			attr_dev(img, "class", "logo");
    			attr_dev(img, "alt", "IOTA");
    			add_location(img, file, 96, 16, 2759);
    			attr_dev(div0, "class", "col-xs-12");
    			add_location(div0, file, 95, 12, 2719);
    			attr_dev(div1, "class", "row");
    			add_location(div1, file, 94, 8, 2689);
    			attr_dev(div2, "class", "col-lg-4");
    			add_location(div2, file, 109, 12, 3131);
    			attr_dev(div3, "class", "row contentrow");
    			add_location(div3, file, 108, 8, 3090);
    			attr_dev(div4, "class", "content");
    			add_location(div4, file, 93, 4, 2659);
    			attr_dev(main, "class", "svelte-1u7rf52");
    			add_location(main, file, 92, 0, 2648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div4);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*capitalize, network*/ 2) && title_value !== (title_value = "" + (capitalize(/*network*/ ctx[1] || "iota") + " Faucet"))) {
    				document_1.title = title_value;
    			}

    			if (!current || dirty & /*networkIco*/ 4) {
    				attr_dev(link, "href", /*networkIco*/ ctx[2]);
    			}

    			if (!current || dirty & /*network*/ 2 && !src_url_equal(img.src, img_src_value = `./${/*network*/ ctx[1] == "iota" || /*network*/ ctx[1] == "shimmer"
			? /*network*/ ctx[1]
			: "iota"}.svg`)) {
    				attr_dev(img, "src", img_src_value);
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
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let errorMessage = null;
    	let network = null;
    	let networkIco = "iota-fav.ico";

    	const setNetwork = token => {
    		if (token === "shimmer" || token === "iota") {
    			$$invalidate(1, network = token);
    			$$invalidate(2, networkIco = `${token}-fav.ico`);
    		} else {
    			$$invalidate(1, network = "whitelabel");
    		}

    		setTheme(token);
    	};

    	const setTheme = token => {
    		if (token === "shimmer") {
    			document.body.classList.add("shimmer");
    		} else if (token === "iota") {
    			document.body.classList.remove("shimmer");
    		} else {
    			document.body.classList.remove("shimmer");
    		}
    	};

    	const networkDetector = data => {
    		if (data.tokenName) {
    			return data.tokenName.toLowerCase();
    		} else {
    			if (data.address.indexOf("rms1") === 0) return "shimmer";
    			if (data.address.indexOf("atoi1") === 0) return "iota";
    		}

    		return "whitelabel";
    	};

    	const getNetwork = async () => {
    		// setTimeout(() => {
    		//     return setNetwork("shimmer");
    		// }, 2000);
    		const endpoint = "https://faucet.alphanet.iotaledger.net/api/plugins/faucet/v1/info";

    		try {
    			const res = await fetch(endpoint);

    			if (res.status === 200) {
    				const data = await res.json();

    				// setTimeout(() => {
    				// errorMessage = "Could not obtain the network from the node.";
    				// }, 2000);
    				return setNetwork(networkDetector(data));
    			} else if (res.status === 429) {
    				$$invalidate(0, errorMessage = "Too many requests. Try again later!");
    			}
    		} catch(error) {
    			if (error.name === "AbortError") {
    				timeout = true;
    			}

    			$$invalidate(0, errorMessage = error);
    		}
    	};

    	onMount(async () => {
    		getNetwork();
    	});

    	const networkParams = {
    		shimmer: { token: "Shimmer", hint: "rms1..." },
    		iota: { token: "IOTA", hint: "atoi1..." },
    		whitelabel: { token: "Whitelabel", hint: "wlab1..." }
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		Page,
    		Loader,
    		ErrorPage,
    		capitalize,
    		errorMessage,
    		network,
    		networkIco,
    		setNetwork,
    		setTheme,
    		networkDetector,
    		getNetwork,
    		networkParams
    	});

    	$$self.$inject_state = $$props => {
    		if ('errorMessage' in $$props) $$invalidate(0, errorMessage = $$props.errorMessage);
    		if ('network' in $$props) $$invalidate(1, network = $$props.network);
    		if ('networkIco' in $$props) $$invalidate(2, networkIco = $$props.networkIco);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [errorMessage, network, networkIco, networkParams];
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
