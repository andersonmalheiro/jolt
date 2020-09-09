/* imports */
import { Reconciler } from "./Reconciler";

/**
 * @typedef {Object} ComponentOptions
 * @property {string} name
 * @property {string|Array.<string>} [styles]
 * @property {boolean} [useShadow=true]
 */

/**
 * Observer Callback
 * @callback ObserverCallback
 * @param {string} [name]
 * @param {string} [value]
 */

/**
 * Component Runtime, used to power the component internals.
 * @class
 * @private
 */
export class Runtime {

    /**
     * Wraps a Function Component into a WebComponent class.
     * @param {Function} component
     * @return {CustomElementConstructor} 
     */
    static wrapFunction(component) {
        return class extends HTMLElement {

            constructor() {
                super();

                /* load the component options */
                const { useShadow } = Runtime.getComponentOptions(component);

                /**
                 * The component attributes
                 * @type {Object.<string,string>}
                 */
                this.attribs = Runtime.getComponentAttributes(this);

                /** 
                 * The component render root
                 * @type {ShadowRoot|HTMLElement}
                 */
                this.root = useShadow ? this.attachShadow({ mode: "open" }) : this;
            }

            connectedCallback() {
                Reconciler.reconcile(component(this.attribs), this.root);

                this._observer = Runtime.getAttributeObserver(this.root, (name, value) => {
                    this.attribs[name] = value;
                    Reconciler.reconcile(component(this.attribs), this.root);
                });
            }

            disconnectedCallback() {
                this._observer.disconnect();
            }
        }
    }

    /**
     * Gets the component options.
     * @param {CustomElementConstructor|Function} component
     * @return {ComponentOptions}
     */
    static getComponentOptions(component) {
        return {
            name: component.options.name,
            styles: component.options.styles,
            useShadow: component.options.useShadow,
        };
    }

    /**
     * Gets the component attributes.
     * @param {CustomElementConstructor|Function} component
     * @return {Object.<string,string>}
     */
    static getComponentAttributes(component) {
        const attributes = {};

        for (let attribute of component.attributes) {
            attributes[attribute.localName] = attribute.value;
        }

        return attributes;
    }

    /**
     * Observes an elements attributes for changes.
     * @param {HTMLElement} element 
     * @param {ObserverCallback} callback
     * @return {MutationObserver}
     */
    static getAttributeObserver(element, callback) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if(mutation.type == "attributes") {
                    const name = mutation.attributeName;
                    callback(name, mutation.target.getAttribute(name));
                }
            });
        });

        observer.observe(element, { attributes: true });

        return observer;
    }
}