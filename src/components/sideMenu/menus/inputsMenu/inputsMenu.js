const {Form, Container, Field} = require('../../../formBuilder/formBuilder');
const Components = require('../../../components');
const EventHandler = require('../../../eventHandler/eventHandler');
const Validator = require('../../../formBuilder/validator');
const Menu = require('../menu');
const InputCard = require('./inputsCard');
const RawInputsList = require('./rawInputsList');
const Tribute = require('tributejs');

module.exports = class InputsMenu extends Menu {

	constructor() {

		super('Entradas', 'inputs_menu');

		this.currentInputName;
		this.button = Field.button({
			text: 'Salvar',
			classList: ['formCenteredBtn', 'green-btn'],
		});

		this.entryInput = new Form({
			newDashboardSpliter: Container.spliter({
				name: Field.text({
					label: 'Tag',
					att: 'name',
					validators: [Validator.isFilled],
				}),
				expression: Field.editableDiv({
					label: 'Expressão',
					att: 'expression',
					validators: [Validator.isFilled],
				}),
				Save: this.button,
			}, {
				startOpen: true,
				text: 'Edição de entradas',
				id: 'inputEditingSpliter',
			}),
		});

		this.rawInputList = new RawInputsList();
		this.eventHandler = new EventHandler();
		this.editMode = false;
		this.tribute;

		this.inputList = document.createElement('div');

	}

	inputListSpliter(id, name, container) {

		const spliter = Components.spliter(id, name, container, true);
		this.menuComponent.appendChild(spliter);

	}

	attInputList() {

		this.tribute.append(1, window.CurrentInputGroup.rawInputs, true);
		this.tribute.append(0, window.CurrentInputGroup.inputs, true);

		this.inputList.innerHTML = '';
		const currentInputGroup = window.CurrentInputGroup.inputs;

		currentInputGroup.forEach((input) => {

			this.inputList.appendChild((new InputCard(input)).htmlComponent);

		});

	}

	newInput() {

		if (!this.entryInput.validate()) return;

		const inputData = this.entryInput.getData();
		inputData.expressionEntry = this.entryInput.fields[1].input;

		inputData.callback = (answer) =>{

			if (answer.error) {

				if (answer.nameError) this.entryInput.formThree.newDashboardSpliter.name.showWarning(answer.nameError);
				if (answer.expressionError) this.entryInput.formThree.newDashboardSpliter.expression.showWarning(answer.expressionError);

			} else {

				this.attInputList();
				this.cleanInputEntry();

			}

		};

		this.EventHandler.NewInput(inputData);

	}

	editInput() {

		if (!this.entryInput.validate()) return;

		const inputData = this.entryInput.getData();
		inputData.expressionEntry = this.entryInput.fields[1].input;

		inputData.callback = (answer) =>{

			if (answer.error) {

				if (answer.nameError) this.entryInput.formThree.newDashboardSpliter.name.showWarning(answer.nameError);
				if (answer.expressionError) this.entryInput.formThree.newDashboardSpliter.expression.showWarning(answer.expressionError);

			} else {

				
				this.button.htmlComponent.textContent = 'Salvar';
				this.cleanInputEntry();
				this.editMode = false;
				this.attInputList();

			}

		};

		inputData.oldName = this.currentInputName;

		this.EventHandler.EditInput(inputData);

	}

	setFormConfigs() {

		this.button.onclick = () => {

			if (!this.editMode) {

				this.newInput();

			} else {

				this.editInput();

			}

		};

	}

	setAutoCompleteConfigs() {

		this.tribute = new Tribute({
			replaceTextSuffix: '',
			noMatchTemplate: function() {

				return '<span style:"visibility: hidden;"></span>';

			},
			collection: [{
				trigger: '${',
				values: [],
				lookup: (input) => {

					return input.name;

				},
				selectTemplate: function(item) {

					return (
						'<a contenteditable="false" class="inputTag">' +
						'${' + item.original.name + '}' +
						'</a>'
					);

				},
			},
			{
				trigger: '#{',
				lookup: (input) => {

					return input.name;

				},
				values: [],
				selectTemplate: function(item) {

					return (
						'<a contenteditable="false" class="inputTag">' +
						'#{' + item.original.name + '}' +
						'</a>'
					);

				},
			},
			],
		});
		this.tribute.attach(this.entryInput.formThree.newDashboardSpliter.expression.input);

	}

	setEditMode(currentName, currentExp) {

		this.button.htmlComponent.textContent = 'Editar entrada';
		this.entryInput.fields[0].value = currentName;
		this.entryInput.fields[1].value = currentExp;
		this.currentInputName = currentName;
		this.editMode = true;

	}

	cleanInputEntry() {

		this.entryInput.fields[0].value = '';
		this.entryInput.fields[1].value = '';

	}

	appendTag(tag) {

		this.entryInput.formThree.newDashboardSpliter.expression.input.appendChild(tag);

	}

	load() {

		this.rawInputList.build();

		this.menuComponent.appendChild(this.entryInput.htmlComponent);
		this.menuComponent.appendChild(this.rawInputList.rawInputList.htmlComponent);

		this.setFormConfigs();
		this.setAutoCompleteConfigs();

		this.inputListSpliter('inputSpliter', 'Entradas Salvas', this.inputList);

		this.eventHandler.addEventListener('AttInputList', () => {

			this.attInputList();

		});

		this.eventHandler.addEventListener('AppendTag', (e) => {

			this.appendTag(e.tag);

		});

		this.eventHandler.addEventListener('SetEditInputMode', (e) => {

			this.setEditMode(e.name, e.exp);

		});

	}

};