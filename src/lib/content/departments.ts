import * as m from '$lib/paraglide/messages';
import type { DepartmentId } from './team';

/** Localized department label, shared by the team listing and member pages. */
export function deptLabel(id: DepartmentId): string {
	switch (id) {
		case 'engineering':
			return m.dept_engineering();
		case 'design':
			return m.dept_design();
		case 'marketing':
			return m.dept_marketing();
		case 'admin':
			return m.dept_admin();
		case 'legal':
			return m.dept_legal();
	}
}
