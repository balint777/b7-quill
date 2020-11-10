import Parchment from 'parchment';
import Delta from 'quill-delta';
import Blockquote from 'quill/formats/blockquote';
import TextBlot from 'quill/blots/text';


class B7Blockquote extends Blockquote {
	static create(value) {
		let domNode = super.create(value);
		domNode.setAttribute('spellcheck', true);
		domNode.classList.add('poem');
		return domNode;
	}

	static formats() {
		return true;
	}

	delta() {
		let text = this.domNode.textContent;
		if (text.endsWith('\n')) {      // Should always be true
			text = text.slice(0, -1);
		}
		return text.split('\n').reduce((delta, frag) => {
			return delta.insert(frag).insert('\n', this.formats());
		}, new Delta());
	}

	format(name, value) {
		if (name === this.statics.blotName && value) return;
		let [text, ] = this.descendant(TextBlot, this.length() - 1);
		if (text != null) {
			text.deleteAt(text.length() - 1, 1);
		}
		super.format(name, value);
	}

	formatAt(index, length, name, value) {
		if (length === 0) return;
		if (Parchment.query(name, Parchment.Scope.BLOCK) == null ||
				(name === this.statics.blotName && value === this.statics.formats(this.domNode))) {
			return;
		}
		let nextNewline = this.newlineIndex(index);
		if (nextNewline < 0 || nextNewline >= index + length) return;
		let prevNewline = this.newlineIndex(index, true) + 1;
		let isolateLength = nextNewline - prevNewline + 1;
		let blot = this.isolate(prevNewline, isolateLength);
		let next = blot.next;
		blot.format(name, value);
		if (next instanceof B7Blockquote) {
			next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
		}
	}

	insertAt(index, value, def) {
		if (def != null) return;
		let [text, offset] = this.descendant(TextBlot, index);
		text.insertAt(offset, value);
	}

	length() {
		let length = this.domNode.textContent.length;
		if (!this.domNode.textContent.endsWith('\n')) {
			return length + 1;
		}
		return length;
	}

	newlineIndex(searchIndex, reverse = false) {
		if (!reverse) {
			let offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
			return offset > -1 ? searchIndex + offset : -1;
		} else {
			return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
		}
	}

	optimize(context) {
		if (!this.domNode.textContent.endsWith('\n')) {
			this.appendChild(Parchment.create('text', '\n'));
		}
		super.optimize(context);
		let next = this.next;
		if (next != null && next.prev === this &&
				next.statics.blotName === this.statics.blotName &&
				this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
			next.optimize(context);
			next.moveChildren(this);
			next.remove();
		}
	}

	replace(target) {
		super.replace(target);
		[].slice.call(this.domNode.querySelectorAll('*')).forEach(function(node) {
			let blot = Parchment.find(node);
			if (blot == null) {
				node.parentNode.removeChild(node);
			} else if (blot instanceof Parchment.Embed) {
				blot.remove();
			} else {
				blot.unwrap();
			}
		});
	}
}
B7Blockquote.blotName = 'b7-blockquote';
B7Blockquote.TAB = '  ';

export default B7Blockquote;
