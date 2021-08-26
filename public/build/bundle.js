
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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

    /* src\App.svelte generated by Svelte v3.42.3 */

    const file = "src\\App.svelte";

    // (76:4) {#if typeof faucetInfo != "undefined"}
    function create_if_block_4(ctx) {
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let t3_value = /*faucetInfo*/ ctx[4].address + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5;
    	let t6_value = /*faucetInfo*/ ctx[4].balance + "";
    	let t6;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			div0.textContent = "Faucet info:";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Address: ");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text("Balance: ");
    			t6 = text(t6_value);
    			attr_dev(div0, "class", "faucetInfo svelte-i8suhf");
    			add_location(div0, file, 76, 8, 2022);
    			attr_dev(div1, "class", "faucetInfo svelte-i8suhf");
    			add_location(div1, file, 77, 8, 2074);
    			attr_dev(div2, "class", "faucetInfo svelte-i8suhf");
    			add_location(div2, file, 78, 8, 2143);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, t5);
    			append_dev(div2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*faucetInfo*/ 16 && t3_value !== (t3_value = /*faucetInfo*/ ctx[4].address + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*faucetInfo*/ 16 && t6_value !== (t6_value = /*faucetInfo*/ ctx[4].balance + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(76:4) {#if typeof faucetInfo != \\\"undefined\\\"}",
    		ctx
    	});

    	return block;
    }

    // (92:4) {:else}
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
    			attr_dev(div, "class", "warning svelte-i8suhf");
    			add_location(div, file, 92, 8, 2561);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
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
    		source: "(92:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if done}
    function create_if_block(ctx) {
    	let div;

    	function select_block_type_1(ctx, dirty) {
    		if (/*success*/ ctx[5]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "warning svelte-i8suhf");
    			add_location(div, file, 81, 8, 2239);
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(81:4) {#if done}",
    		ctx
    	});

    	return block;
    }

    // (98:12) {:else}
    function create_else_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please enter a valid IOTA address (atoi1...)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(98:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:28) 
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Click the request button to receive your coins");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(96:28) ",
    		ctx
    	});

    	return block;
    }

    // (94:12) {#if waiting}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Please wait...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(94:12) {#if waiting}",
    		ctx
    	});

    	return block;
    }

    // (85:12) {:else}
    function create_else_block(ctx) {
    	let t0_value = "Eror:" + JSON.stringify(/*data*/ ctx[6]) + "";
    	let t0;
    	let t1;
    	let t2_value = setTimeout(/*func*/ ctx[9], 5000) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 64 && t0_value !== (t0_value = "Eror:" + JSON.stringify(/*data*/ ctx[6]) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*done*/ 4 && t2_value !== (t2_value = setTimeout(/*func*/ ctx[9], 5000) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(85:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (83:12) {#if success}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "IOTA will be sent";
    			add_location(div, file, 83, 16, 2305);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(83:12) {#if success}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let p0;
    	let t1;
    	let h1;
    	let t3;
    	let p1;
    	let t5;
    	let t6;
    	let t7;
    	let div0;
    	let label;
    	let t9;
    	let input;
    	let t10;
    	let div1;
    	let button;
    	let mounted;
    	let dispose;
    	let if_block0 = typeof /*faucetInfo*/ ctx[4] != "undefined" && create_if_block_4(ctx);

    	function select_block_type(ctx, dirty) {
    		if (/*done*/ ctx[2]) return create_if_block;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			p0 = element("p");
    			p0.textContent = "Welcome to";
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "IOTA Faucet";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "This service distributes tokens to the requested IOTA address.";
    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if_block1.c();
    			t7 = space();
    			div0 = element("div");
    			label = element("label");
    			label.textContent = "IOTA Address";
    			t9 = space();
    			input = element("input");
    			t10 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Request";
    			attr_dev(p0, "class", "welcome svelte-i8suhf");
    			add_location(p0, file, 70, 4, 1805);
    			attr_dev(h1, "class", "svelte-i8suhf");
    			add_location(h1, file, 71, 4, 1844);
    			attr_dev(p1, "class", "help svelte-i8suhf");
    			add_location(p1, file, 72, 4, 1870);
    			attr_dev(label, "for", "address");
    			attr_dev(label, "class", "svelte-i8suhf");
    			add_location(label, file, 103, 8, 2904);
    			attr_dev(input, "type", "text");
    			input.disabled = /*waiting*/ ctx[0];
    			attr_dev(input, "class", "svelte-i8suhf");
    			add_location(input, file, 104, 8, 2955);
    			attr_dev(div0, "class", "iota-input svelte-i8suhf");
    			add_location(div0, file, 102, 4, 2870);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-i8suhf");
    			toggle_class(button, "disabled", /*waiting*/ ctx[0] || !/*valid*/ ctx[1]);
    			add_location(button, file, 112, 8, 3144);
    			attr_dev(div1, "class", "right svelte-i8suhf");
    			add_location(div1, file, 111, 4, 3115);
    			attr_dev(main, "class", "svelte-i8suhf");
    			add_location(main, file, 69, 0, 1793);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, p0);
    			append_dev(main, t1);
    			append_dev(main, h1);
    			append_dev(main, t3);
    			append_dev(main, p1);
    			append_dev(main, t5);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t6);
    			if_block1.m(main, null);
    			append_dev(main, t7);
    			append_dev(main, div0);
    			append_dev(div0, label);
    			append_dev(div0, t9);
    			append_dev(div0, input);
    			set_input_value(input, /*address*/ ctx[3]);
    			append_dev(main, t10);
    			append_dev(main, div1);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[10]),
    					listen_dev(input, "keyup", /*validate*/ ctx[7], false, false, false),
    					listen_dev(button, "click", /*requestTokens*/ ctx[8], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (typeof /*faucetInfo*/ ctx[4] != "undefined") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(main, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(main, t7);
    				}
    			}

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
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
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

    const explorer = "https://explorer.iota.org/testnet/";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let waiting = false;
    	let valid = false;
    	let done = false;
    	let timeout = false;
    	let address = "";
    	let faucetInfo;
    	let success = false;
    	let data = null;

    	function validate(event) {
    		$$invalidate(2, done = false);

    		if (address.length == 64 && address.indexOf("atoi1") === 0) {
    			$$invalidate(1, valid = true);
    		} else {
    			$$invalidate(1, valid = false);
    		}
    	}

    	async function requestTokens(_event) {
    		if (waiting) {
    			return false;
    		}

    		$$invalidate(0, waiting = true);
    		let res = "Sending request...";

    		try {
    			res = await fetch(`/api/plugins/faucet/enqueue`, {
    				method: "POST",
    				headers: {
    					Accept: "application/json",
    					"Content-Type": "application/json"
    				},
    				body: JSON.stringify({ address })
    			});

    			$$invalidate(6, data = await res.json());
    		} catch(error) {
    			if (error.name === "AbortError") {
    				timeout = true;
    			}
    		}

    		$$invalidate(5, success = res && res.status === 202);
    		$$invalidate(2, done = true);
    		$$invalidate(0, waiting = false);
    		$$invalidate(3, address = "");
    	}

    	setInterval(
    		function () {
    			requestFaucetInfo();
    		},
    		10000
    	);

    	async function requestFaucetInfo() {
    		let res = null;

    		try {
    			res = await fetch("/api/plugins/faucet/info");
    			let data = await res.json();
    			$$invalidate(4, faucetInfo = data.data);
    		} catch(error) {
    			if (error.name === "AbortError") {
    				timeout = true;
    			}
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const func = () => {
    		$$invalidate(2, done = false);
    	};

    	function input_input_handler() {
    		address = this.value;
    		$$invalidate(3, address);
    	}

    	$$self.$capture_state = () => ({
    		waiting,
    		valid,
    		done,
    		timeout,
    		address,
    		faucetInfo,
    		success,
    		data,
    		explorer,
    		validate,
    		requestTokens,
    		requestFaucetInfo
    	});

    	$$self.$inject_state = $$props => {
    		if ('waiting' in $$props) $$invalidate(0, waiting = $$props.waiting);
    		if ('valid' in $$props) $$invalidate(1, valid = $$props.valid);
    		if ('done' in $$props) $$invalidate(2, done = $$props.done);
    		if ('timeout' in $$props) timeout = $$props.timeout;
    		if ('address' in $$props) $$invalidate(3, address = $$props.address);
    		if ('faucetInfo' in $$props) $$invalidate(4, faucetInfo = $$props.faucetInfo);
    		if ('success' in $$props) $$invalidate(5, success = $$props.success);
    		if ('data' in $$props) $$invalidate(6, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		waiting,
    		valid,
    		done,
    		address,
    		faucetInfo,
    		success,
    		data,
    		validate,
    		requestTokens,
    		func,
    		input_input_handler
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
