const Blocks = require('../blocks/Blocks');
const BlockMenu = require('./blockMenu');
const EventHandler = require('../eventHandler/eventHandler');
const Components = require('../components');

module.exports = class BlockContainer {

	constructor(preConfig) {

		this.eventHandler = new EventHandler();

		this.preConfig = preConfig;
		this.width = 3;
		this.height = 2;
		this.editing = false;

		this.build();

		this.trash = Components.buttonWithIcon('trash-alt-regular', 'trashBlockButton');
		this.trash.style.display = 'none';

		this.setEvents();
		
	}

	buildHeader() {

		this.header = document.createElement('div');
		this.header.innerText='titulo 1';
		this.header.classList.add('blockHeader');
		return this.header;

	}

	buildBody() {

		const body = document.createElement('div');

		body.classList.add('grid-stack-item-content');

		return body;

	}

	build() {

		this.htmlComponent = document.createElement('div');
		this.htmlComponent.classList.add('grid-stack-item');
		this.content = document.createElement('div');
		this.content.style.flex = '1';

		this.body = this.buildBody();
		this.header = this.buildHeader();
		
		this.body.appendChild(this.header);
		this.body.appendChild(this.content);
		
		this.htmlComponent.appendChild(this.body);

	}

	init() {

		this.block = new Blocks[this.preConfig.type](this.preConfig);
		this.content.innerHTML = '';
		this.content.appendChild(this.block.htmlComponent);
		this.htmlComponent.appendChild(this.trash);
		this.block.init();

	}

	updateBlockConfig(newConfig) {

		console.log(newConfig);

		this.eventHandler.dispatchEvent('DashboardNotSaved');

		if (newConfig.type === this.block.type) {

			this.block.updateConfig(newConfig);

		} else {

			try {

				this.preConfig = newConfig;
				this.block = new Blocks[this.preConfig.type](this.preConfig);
				this.htmlComponent.innerHTML = '';

				this.content = this.block.htmlComponent;
				this.htmlComponent.appendChild(this.content);
				this.block.init();

			} catch (error) {

				console.warn('TIPO DE BLOCO AINDA NÃO IMPLEMENTADO: ' + newConfig.type, error);

			}

		}

	}

	sendBlockInstruction(newInstruction) {
		
		this.eventHandler.dispatchEvent('DashboardNotSaved');
		this.block.instructionHandler(newInstruction);

	}

	editBlock() {

		if (!this.editing) {

			this.body.classList.add('editingBlock');
			this.editing = true;
			window.CurrentBlock = this;

			this.eventHandler.BlockWasSelected(this);

			this.eventHandler.OpenSideMenu({
				requested: 'edit',
			});

			this.eventHandler.OpenMenu({
				name: 'edit',
			});

			this.eventHandler.SetSelectionEffect({
				name: 'edit',
			});

		} else {

			window.CurrentBlock = undefined;
			this.body.classList.remove('editingBlock');
			this.editing = false;

			this.eventHandler.OpenMenu({
				name: 'edit',
			});

		}

	}

	blockLog() {

		return {
			preConfig: this.preConfig,
			x: this.htmlComponent.dataset.gsX,
			y: this.htmlComponent.dataset.gsY,
			w: this.htmlComponent.dataset.gsWidth,
			h: this.htmlComponent.dataset.gsHeight,
		};

	}

	setEvents() {
		
		this.htmlComponent.ondblclick = () => {

			this.editBlock();

		};

		this.htmlComponent.onmouseover = () => {
			
			this.trash.style.display = 'block';

		};

		this.htmlComponent.onmouseleave = () => {
			
			this.trash.style.display = 'none';

		};

		this.htmlComponent.addEventListener('contextmenu', (evt) => {

			const blockMenu = new BlockMenu(this);

			evt.preventDefault();
			blockMenu.menuPopUp();

		});

		this.trash.addEventListener('click', (evt) => {

			this.eventHandler.dispatchEvent('RemoveBlock', this);

		});

		this.eventHandler.addEventListener('BlockWasSelected', (evt) => {

			if (evt !== this) {

				this.body.classList.remove('editingBlock');
				this.editing = false;

			}

		});

		this.eventHandler.addEventListener('DataIsProcessed', (evt)=>{

			this.block.updateData(evt);

		});
	
	}

};