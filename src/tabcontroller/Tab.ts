import { DNode } from '@dojo/widget-core/interfaces';
import { ThemeableMixin, ThemeableProperties, theme } from '@dojo/widget-core/mixins/Themeable';
import { v } from '@dojo/widget-core/d';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';

import * as css from './styles/tabController.m.css';

/**
 * @type TabProperties
 *
 * Properties that can be set on a Tab component
 *
 * @property closeable    Determines whether this tab can be closed
 * @property disabled     Determines whether this tab can become active
 * @property id           ID of this underlying DOM element
 * @property key          A unique identifier for this Tab within the TabController
 * @property label        Content to show in the TabController control bar for this tab
 * @property labelledBy   ID of DOM element that serves as a label for this tab
 */
export interface TabProperties extends ThemeableProperties {
	closeable?: boolean;
	disabled?: boolean;
	id?: string;
	key: string;
	label?: DNode;
	labelledBy?: string;
};

export const TabBase = ThemeableMixin(WidgetBase);

@theme(css)
export default class Tab extends TabBase<TabProperties> {
	render(): DNode {
		const {
			id,
			labelledBy
		} = this.properties;

		return v('div', {
			'aria-labelledby': labelledBy,
			classes: this.classes(css.tab),
			id,
			role: 'tabpanel'
		}, this.children);
	}
}
