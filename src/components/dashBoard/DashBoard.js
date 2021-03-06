const ipcRenderer = require('electron').ipcRenderer;
const GridStack = require('gridstack/dist/gridstack.all');
const hash = require('object-hash');
const BlockContainer = require('../blockContainer/blockContainer');
const EventHandler = require('../eventHandler/eventHandler');
const BSONconverter = require('../../classes/bson');
const DashBoard = require('../../classes/dashBoard');
const Dialog = require('../dialog/dialog');

module.exports = class DahsBoard {

	constructor() {

		this.DashBoardComponent = document.getElementById('DashBoard');
		this.GridStackComponent = document.getElementById('main_grids_stack');

		this.DashBoardComponent.style.width = String(Math.floor(31 * (screen.width / 32)) + 'px');
		this.GridStackComponent.style.width = String(Math.floor(31 * (screen.width / 32)) + 'px');
		this.blocks = [];
		this.gridStack;

		this.eventHandler = new EventHandler();
		this.BSON = new BSONconverter();

	}

	build() {

		this.gridStack = GridStack.init({
			float: true,
			column: 12,
			animate: true,

		});

		this.gridStack.enable('.grid-stack-item-content', true);

		this.eventHandler.addEventListener('AddNewBlock', (evt) => {

			this.addNewBlock(evt);

		});
		
		this.eventHandler.addEventListener('RemoveBlock', (evt) => {
			
			this.removeBlock(evt);
			
		});
		
		this.eventHandler.addEventListener('ClearDashboard', () => {

			this.gridStack.removeAll();
			this.blocks = [];

		});

		this.eventHandler.addEventListener('InitBlocks', () => {

			this.initBlocks();

		});

		this.eventHandler.addEventListener('SaveDashboard', (evt) => {

			this.saveDashboard();

		});

		ipcRenderer.on('SaveDashboard', (evt, onClose) => {

			this.saveDashboard(onClose);

		});

		this.eventHandler.addEventListener('ImportDashboard', (evt) => {

			this.importDashboard(evt);

		});

		ipcRenderer.on('ImportDashboard', (evt) => {

			ipcRenderer.send('open-file-dialog-for-file', 'bson');

			ipcRenderer.on('selected-dir', (evt, arg) => {

				this.importDashboard(arg);
					
				ipc.removeAllListeners('selected-dir');

			});

		});

	}

	addNewBlock(blockConfig) {

		const newBlock = new BlockContainer(blockConfig || {});
		this.blocks.push(newBlock);
		this.gridStack.addWidget(newBlock.htmlComponent, newBlock);

		newBlock.init();

	}

	removeBlock(removedBlock) {

		this.blocks = this.blocks.filter((block) => block !== removedBlock);
		this.gridStack.removeWidget(removedBlock.htmlComponent);

	}

	initBlocks() {

		window.CurrentDashBoard.blocks.forEach((block) => {

			const newBlock = new BlockContainer(block.preConfig);
			
			this.gridStack.addWidget(newBlock.htmlComponent, {
				x: Number(block.x),
				y: Number(block.y),
				height: Number(block.h),
				width: Number(block.w),
			});

			this.blocks.push(newBlock);
			newBlock.init();
			
		});

		this.gridStack.on('added change enable removed', (evt, el) => {

			this.eventHandler.dispatchEvent('DashboardNotSaved');

		});

	}

	saveDashboard(onClose) {
		
		const blocksLog = [];
		const currentDashBoard = window.CurrentDashBoard;
		
		this.blocks.forEach((block) => blocksLog.push(block.blockLog()));
		
		currentDashBoard.blocks = blocksLog;
		currentDashBoard.saved = true;
		
		const dashboardHash = hash(currentDashBoard);
		currentDashBoard.hash = dashboardHash;
		
		this.BSON.writeFile(currentDashBoard.path, currentDashBoard);
		
		ipcRenderer.send('isSaved', true);
		
		if (onClose) ipcRenderer.send('closeOnSave');

	}

	importDashboard(path) {
		
		const dashboardJSON = this.BSON.readFile(path);
		const dashboardHash = dashboardJSON.hash;
		const dashboard = new DashBoard(dashboardJSON);
		
		if (dashboard.blocks.length === 0) {
			
			dashboard.inputGroup.inputGraph = {};
			
		}
		
		const dashboardIdealHash = hash(dashboard);
		
		if (dashboardHash === dashboardIdealHash) {
			
			dashboard.path = path;
			this.eventHandler.dispatchEvent('OpenImportedDashboard', dashboard);

		} else {

			Dialog.showDialog({
				title: 'Error',
				message: 'Este dashboard foi modificado externamente e não pode ser aberto.',
				buttons: ['Ok'],
			});

		}

	}

};