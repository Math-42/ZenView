const Container = require('../../../../../formBuilder/formBuilder').Container;
const Field = require('../../../../../formBuilder/formBuilder').Field;
const PlotlyLayoutConfig = require('./plotlyLayout');
const PlotlyScatter = require('./types/scatter');


module.exports = class PlotlyEditMenu {

	constructor() {

		this.plotlyScatter = new PlotlyScatter();
		
		this.form = Container.div({
			plotTypes: Container.spliter(
				{
					plotType: Field.select({
						label: 'Selecione um tipo: ',
						att: 'type',
						id: 'plotlyTypeSelector',
						options: [
							{
								text: 'scatter',
							},
							{
								text: 'bar',
							},
							{
								text: 'heatmap',
							},
							{
								text: 'pie',
							},
							{
								text: 'image',
							},
							{
								text: 'table',
							},
						],
					}),
					exportType: Field.select({
						label: 'Selecione um tipo: ',
						att: 'config.toImageButtonOptions.format',
						options: [
							{
								text: 'Png',
								value: 'png',
							},
							{
								text: 'Svg',
								value: 'svg',
							},
							{
								text: 'Jpeg',
								value: 'jpeg',
							},
							{
								text: 'Webp',
								value: 'webp',
							},
						],

					}),
				},
				{
					startOpen: true,
					text: 'Tipos de plot',
					id: 'plotlyType',
				},
			),
			layoutConfig: PlotlyLayoutConfig,
			scatterConfig: this.plotlyScatter.form,
		},
			{
				id: 'PlotlyEditMenuConfig',
				att: 'Plotly',
				conditions: [
					{
						id: 'BlockModule',
						att: 'value',
						requiredValue: 'Plotly',
					},
				],
			},
		);

	}

};