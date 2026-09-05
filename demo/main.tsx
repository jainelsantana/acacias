import { hydrateRoot } from 'react-dom/client';
import BandHome from '../components/band-home';
import { demoContent } from './content';
import '../app/globals.css';
import '../app/motion.css';
import './preview.css';

hydrateRoot(document.getElementById('root')!, <BandHome content={demoContent} staticDemo />);
