import site from './site.json';
import gallery from './gallery.json';
import events from './events.json';
import instagram from './instagram.json';
import de from './de.json';
import en from './en.json';
import { assemble } from './assemble.js';

/** Every editable file, as the CMS stores it (see assemble.js for the layout). */
export const files = { site, gallery, events, instagram, de, en };

const content = assemble(files);
export default content;
