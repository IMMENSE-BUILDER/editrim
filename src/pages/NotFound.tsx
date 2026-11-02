import { Link } from 'react-router-dom';

import { Logo } from '../components/Brand';
import { VellumIcon } from '../components/VellumIcon';

export default function NotFound() {
  return (
    <div className="notfound">
      <Link to="/"><Logo size={38} /></Link>
      <div className="notfound-code">404</div>
      <h1>This page isn’t<br /><span className="serif-italic">on the canvas.</span></h1>
      <p>The link may be old, or the page moved. The editor is still exactly where you left it.</p>
      <div className="notfound-actions">
        <Link to="/dashboard" className="btn btn-cobalt">Your designs <VellumIcon name="arrowRight" size={15} /></Link>
        <Link to="/" className="btn btn-secondary">Back to Vellum</Link>
      </div>
    </div>
  );
}
