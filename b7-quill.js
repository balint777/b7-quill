import { LitElement, html, css } from 'lit-element';
import Quill from 'quill/quill';

import quillStyles from 'quill/assets/core.styl';
import quillSnow from 'quill/assets/snow.styl';

import B7Blockquote from './b7-blockquote';

Quill.register({
	'formats/b7-blockquote': B7Blockquote,
});

class B7Quill extends LitElement
{
	static get properties()
	{
		return {
			content: Object,
			readOnly: {
				type: Boolean,
				value: true
			}
		};
	}

	static get externalStyles()
	{
		return {
			quill: quillStyles,
			quillSnow: quillSnow,
			bLineQuill: css`

			article[slot=quill] {
				border: none;
				font-family: Georgia, serif;
				font-size: 1.2rem;
			}

			article[slot=quill] p {
				line-height: 1.8;
				text-indent: 1.8em;
				/* text-align: justify; */
				/* font-family: 'DIN Pro Light', sans-serif; */
				margin-bottom: 1.5em;
				color: hsla(0, 0%, 22%, 0.8);
			}

			article[slot=quill] p:first-child {
				text-indent: unset;
			}

			article[slot=quill] img {
				width: 100%;
				display: block;
			}

			article[slot=quill] p:first-child > img:first-child {
				margin-left: unset;
			}

			article[slot=quill] p:first-child:first-letter {
				float: left;
				font-size: 3.2em;
				line-height: 1em;
				padding-top: 0;
				padding-right: .2em;
				padding-left: .1em;
			}

			article[slot=quill] blockquote {
				font-family: Georgia, serif;
				font-weight: light;
				font-size: 18px;
				font-style: italic;
				margin: 0.25em 0;
				padding: 0.35em 40px;
				line-height: 1.45;
				color: #383838;
			}

			.ql-toolbar.ql-snow {
				position: sticky;
				top: 0;
				z-index: 2;
				background: white;
			}`
		};
	}

	static get styles()
	{
		return [
			css`
			:host {
				display: block;
			}`
		];
	}

	render()
	{
		return html`
			<slot></slot>
			<slot name="quill" slot="quill"></slot>
		`;
	}

	firstUpdated()
	{
		const readOnly = this.hasAttribute('read-only');
		let est = B7Quill.externalStyles;
		for(let key in est) {
			if (!document.getElementById(key)) {
				let styleNode = document.createElement('style');
				styleNode.id = key;
				styleNode.innerText = est[key].toString();
				document.head.appendChild(styleNode);
			}

		}
		if (readOnly) {
			this._editor_container = document.createElement('template');
			this._editor_node = document.createElement('article');
			this._editor_container.appendChild(this._editor_node);
		} else {
			this._editor_node = this.shadowRoot.querySelector('slot[name=quill]').assignedElements({ flatten: true })[0];
		}

		this._editor = new Quill(
			this._editor_node,
			{
				modules: {
					toolbar: [
						[{ 'header': [1, 2, 3, false] }, { 'font': ['sans'] }],

						['blockquote', 'link', 'image', 'b7-blockquote'],

						['bold', 'italic'], // toggled buttons

						[{ 'list': 'ordered' }, { 'list': 'bullet' }],

						['clean'] // remove formatting button
					]
				},
				placeholder: 'Compose an epic...',
				readOnly: readOnly,
				theme: 'snow'
			}
		);
	}

	updated(changedProperties)
	{
		let article_node = document.querySelector('article[slot=quill]');

		if (changedProperties.has('content')) {
			this._editor.setContents(this.content);
			if (this.hasAttribute('read-only')) setTimeout(() => { article_node.innerHTML = this._editor_node.firstChild.innerHTML }, 0);
		}
		if (changedProperties.has('readOnly')) this._editor.enable(!this.readOnly);

		if (this.content) {
			let contentReadyAttribute = document.createAttribute('content-ready');
			this.setAttributeNode(contentReadyAttribute);
		}
	}

	getContents()
	{
		return this._editor.getContents();
	}
}

customElements.define('b7-quill', B7Quill);
