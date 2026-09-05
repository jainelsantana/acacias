import { renderToString } from 'react-dom/server';
import BandHome from '../components/band-home';
import { demoContent } from './content';

export function render() { return renderToString(<BandHome content={demoContent} staticDemo />); }
