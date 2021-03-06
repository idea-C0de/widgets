import harness from '@dojo/test-extras/harness';
import { v, w } from '@dojo/widget-core/d';
import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import * as sinon from 'sinon';
import TimePicker, { getOptions, parseUnits } from '../../TimePicker';
import * as css from '../../styles/timePicker.m.css';
import ComboBox, { ComboBoxProperties } from '../../../combobox/ComboBox';
import Label, { parseLabelClasses } from '../../../label/Label';

registerSuite({
	name: 'TimePicker',

	getOptions: {
		'Should include each minute for a full day by default'() {
			const options = getOptions();

			assert.lengthOf(options, 1440);
		},

		'Should allow steps under 60 seconds'() {
			const options = getOptions('00:00:00', '00:00:10', 1);

			assert.lengthOf(options, 11);
			options.forEach((option, i) => {
				const { hour, minute, second } = option;

				assert.strictEqual(hour, 0);
				assert.strictEqual(minute, 0);
				assert.strictEqual(second, i);
			});
		}
	},

	parseUnits() {
		assert.throws(parseUnits.bind(null, ''));
		assert.throws(parseUnits.bind(null, '273:00:00'));
		assert.throws(parseUnits.bind(null, 'x@1235s'));
		assert.throws(parseUnits.bind(null, '7:00'));
		assert.throws(parseUnits.bind(null, '07:0a'));

		const units = { hour: 13 };
		assert.strictEqual(parseUnits(units), units);
		assert.deepEqual(parseUnits('23:44:50'), {
			hour: 23,
			minute: 44,
			second: 50
		});
		assert.deepEqual(parseUnits('00:00'), {
			hour: 0,
			minute: 0,
			second: 0
		});
		assert.deepEqual(parseUnits('55:98:72'), {
			hour: 55,
			minute: 98,
			second: 72
		}, 'does not check for invalid units');
	},

	'Custom input': {
		'Should delegate to ComboBox'() {
			const picker = harness(TimePicker);
			picker.setProperties({
				autoBlur: false,
				clearable: true,
				disabled: false,
				formId: 'form',
				invalid: true,
				label: 'Some Field',
				openOnFocus: false,
				readOnly: false,
				required: true,
				value: 'some value'
			});

			picker.expectRender(w(ComboBox, <ComboBoxProperties> {
				autoBlur: false,
				clearable: true,
				customResultItem: undefined,
				customResultMenu: undefined,
				disabled: false,
				formId: 'form',
				getResultLabel: <any> picker.listener,
				inputProperties: undefined,
				invalid: true,
				isResultDisabled: undefined,
				label: 'Some Field',
				onBlur: undefined,
				onChange: undefined,
				onFocus: undefined,
				onMenuChange: undefined,
				onRequestResults: picker.listener,
				openOnFocus: false,
				extraClasses: undefined,
				readOnly: false,
				required: true,
				results: undefined,
				theme: undefined,
				value: 'some value'
			}));

			picker.destroy();
		},

		'Should use `getOptionLabel` to format menu options'() {
			const picker = harness(TimePicker);
			const getOptionLabel = sinon.spy();
			const option = { hour: 0 };

			picker.setProperties({ getOptionLabel });
			const vnode: any = picker.getRender();

			vnode.properties.getResultLabel(option);
			assert.isTrue(getOptionLabel.calledWith(option));
			picker.destroy();
		},

		'Should format options as `HH:mm` by default'() {
			const picker = harness(TimePicker);
			const vnode: any = picker.getRender();
			const label = vnode.properties.getResultLabel({ hour: 4, minute: 22, second: 0 });

			assert.strictEqual(label, '04:22');

			picker.destroy();
		},

		'Should format options as `HH:mm:ss` when the step is less than 60 seconds'() {
			const picker = harness(TimePicker);
			picker.setProperties({ step: 1 });
			const vnode: any = picker.getRender();
			const label = vnode.properties.getResultLabel({ hour: 4, minute: 22, second: 0 });

			assert.strictEqual(label, '04:22:00');

			picker.destroy();
		},

		'Should call onRequestOptions'() {
			const picker = harness(TimePicker);
			const onRequestOptions = sinon.spy();

			picker.setProperties({
				onRequestOptions,
				step: 3600
			});

			const vnode: any = picker.getRender();
			vnode.properties.onRequestResults('12:34:56');

			assert.isTrue(onRequestOptions.calledWith('12:34:56'));

			const expectedOptions = getOptions('00:00:00', '23:00', 3600);
			const actualOptions = onRequestOptions.firstCall.args[1];
			assert.sameDeepMembers(actualOptions, expectedOptions);

			vnode.properties.onRequestResults('12:34:56');
			assert.strictEqual(actualOptions, onRequestOptions.secondCall.args[1], 'The options array should be cached.');

			picker.destroy();
		}
	},

	'Native input': {
		basic() {
			const picker = harness(TimePicker);
			const inputClasses = picker.classes(css.input);

			picker.setProperties({
				name: 'some-field',
				useNativeElement: true
			});
			picker.expectRender(v('span', {
				classes: picker.classes(css.root),
				key: 'root'
			}, [
				v('input', {
					'aria-describedby': undefined,
					'aria-invalid': null,
					'aria-readonly': null,
					classes: inputClasses,
					disabled: undefined,
					invalid: undefined,
					key: 'native-input',
					max: undefined,
					min: undefined,
					name: 'some-field',
					onblur: picker.listener,
					onchange: picker.listener,
					onfocus: picker.listener,
					readOnly: undefined,
					required: undefined,
					step: undefined,
					type: 'time',
					value: undefined
				})
			]));

			picker.destroy();
		},

		'Attributes added'() {
			const picker = harness(TimePicker);
			const inputClasses = picker.classes(
				css.disabled,
				css.input,
				css.invalid,
				css.readonly,
				css.required
			);

			picker.setProperties({
				disabled: true,
				end: '12:00',
				inputProperties: { describedBy: 'Some descriptive text' },
				invalid: true,
				name: 'some-field',
				readOnly: true,
				required: true,
				start: '10:00',
				step: 60,
				useNativeElement: true,
				value: '11:30'
			});

			picker.expectRender(v('span', {
				classes: picker.classes(css.root),
				key: 'root'
			}, [
				v('input', {
					'aria-describedby': 'Some descriptive text',
					'aria-invalid': 'true',
					'aria-readonly': 'true',
					classes: inputClasses,
					disabled: true,
					invalid: true,
					key: 'native-input',
					max: '12:00',
					min: '10:00',
					name: 'some-field',
					onblur: picker.listener,
					onchange: picker.listener,
					onfocus: picker.listener,
					readOnly: true,
					required: true,
					step: 60,
					type: 'time',
					value: '11:30'
				})
			]));

			picker.destroy();
		},

		'Label should render'() {
			const picker = harness(TimePicker);
			const inputClasses = picker.classes(css.input);
			picker.setProperties({
				label: 'foo',
				useNativeElement: true
			});
			picker.expectRender(v('span', {
				classes: picker.classes(css.root),
				key: 'root'
			}, [
				w(Label, {
					extraClasses: { root: parseLabelClasses(picker.classes(css.input)()) },
					formId: undefined,
					theme: undefined,
					label: 'foo'
				}, [
					v('input', {
						'aria-describedby': undefined,
						'aria-invalid': null,
						'aria-readonly': null,
						classes: inputClasses,
						disabled: undefined,
						invalid: undefined,
						key: 'native-input',
						max: undefined,
						min: undefined,
						name: undefined,
						onblur: picker.listener,
						onchange: picker.listener,
						onfocus: picker.listener,
						readOnly: undefined,
						required: undefined,
						step: undefined,
						type: 'time',
						value: undefined
					})
				])
			]));

			picker.destroy();
		},

		'Label should have state classes'() {
			const picker = harness(TimePicker);
			picker.setProperties({
				label: 'foo',
				useNativeElement: true
			});
			let vnode: any = picker.getRender();
			let label = vnode.children[0];
			let classes: any = label.properties.extraClasses;

			assert.deepEqual(classes, { root: parseLabelClasses(picker.classes(css.input)()) });

			picker.setProperties({
				disabled: true,
				invalid: true,
				label: 'foo',
				readOnly: true,
				required: true,
				useNativeElement: true
			});
			vnode = picker.getRender();
			label = vnode.children[0];

			classes = label.properties.extraClasses;
			assert.deepEqual(classes, { root: parseLabelClasses(picker.classes(css.input, css.disabled, css.invalid, css.readonly, css.required)()) });

			picker.destroy();
		},

		'`onBlur` should be called'() {
			const picker = harness(TimePicker);
			const onBlur = sinon.spy();

			picker.setProperties({
				onBlur,
				useNativeElement: true,
				value: '12:34:56'
			});
			picker.sendEvent('blur', {
				selector: 'input[type=time]'
			});

			assert.isTrue(onBlur.calledWith('12:34:56'), '`onBlur` should be called with the value');
			picker.destroy();
		},

		'`onChange` should be called'() {
			const picker = harness(TimePicker);
			const onChange = sinon.spy();

			picker.setProperties({
				onChange,
				useNativeElement: true,
				value: '12:34:56'
			});
			picker.sendEvent('change', {
				selector: 'input[type=time]'
			});

			assert.isTrue(onChange.calledWith('12:34:56'), '`onChange` should be called with the value');

			picker.destroy();
		},

		'`onFocus` should be called'() {
			const picker = harness(TimePicker);
			const onFocus = sinon.spy();
			picker.setProperties({
				onFocus,
				useNativeElement: true,
				value: '12:34:56'
			});

			picker.sendEvent('focus', {
				selector: 'input[type=time]'
			});

			assert.isTrue(onFocus.calledWith('12:34:56'), '`onFocus` should be called with the value');
			picker.destroy();
		}
	}
});
