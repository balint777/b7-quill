import { LitElement, html, css } from 'lit-element';
import Quill from 'quill/quill';

import Toolbar from 'quill/modules/toolbar';
import Bubble from 'quill/themes/bubble';
import Snow from 'quill/themes/snow';

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';
import Blockquote from 'quill/formats/blockquote';
import Image from 'quill/formats/image';


import quillStyles from 'quill/assets/core.styl';
import quillSnow from 'quill/assets/snow.styl';

import B7Blockquote from './b7-blockquote';

Quill.register({
	'modules/toolbar': Toolbar,
	'themes/bubble': Bubble,
	'themes/snow': Snow,
	'formats/bold': Bold,
	'formats/italic': Italic,
	'formats/header': Header,
	'formats/blockquote': Blockquote,
	'formats/image': Image,
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

	static get styles()
	{
		return [css`
			:host {
				display: block;
			}

			#article {
				border: none;
				font-family: Georgia, serif;
				font-size: 1.2rem;
			}

			#article p {
				line-height: 1.8;
				text-indent: 1.8em;
				/* text-align: justify; */
				/* font-family: 'DIN Pro Light', sans-serif; */
				margin-bottom: 1.5em;
				color: hsla(0, 0%, 22%, 0.8);
			}

			#article p:first-child {
				text-indent: unset;
			}

			#article img {
				width: 100%;
				display: block;
			}

			#article p:first-child > img:first-child {
				margin-left: unset;
			}

			#article p:first-child:first-letter {
				float: left;
				font-size: 3.2em;
				line-height: 1em;
				padding-top: 0;
				padding-right: .2em;
				padding-left: .1em;
			}

			#article blockquote {
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
			}
		`];
	}

	render()
	{
		return html`
			<style>
				${quillStyles}
				${quillSnow}
			</style>
			<article id="article"></article>
		`;
	}

	firstUpdated()
	{
		this._editor_container = this.hasAttribute('read-only') ? document.createElement('template') : this.shadowRoot;
		this._editor_node = this.hasAttribute('read-only') ? document.createElement('article') : this.shadowRoot.querySelector('#article');
		this._editor_container.appendChild(this._editor_node);

		this._editor = new Quill(
			this._editor_node,
			{
				modules: {
					toolbar: [
						[{ 'header': [1, 2, 3, false] }, { 'font': ['sans'] }],

						['blockquote', 'link', 'image', 'b-line-blockquote'],

						['bold', 'italic'], // toggled buttons

						[{ 'list': 'ordered' }, { 'list': 'bullet' }],

						['clean'] // remove formatting button
					]
				},
				placeholder: 'Compose an epic...',
				readOnly: this.hasAttribute('read-only'),
				theme: 'snow'
			}
		);
	}

	updated(changedProperties)
	{
		let article_node = this.shadowRoot.getElementById('article');

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
