import { Link } from 'react-router-dom';

import { Logo } from '../components/Brand';
import { EditrimIcon } from '../components/EditrimIcon';

export default function NotFound() {
  return (
    <div className="notfound">
      <Link to="/"><Logo size={38} /></Link>
      <div className="notfound-code">404</div>
      <h1>This page isn’t<br /><span className="serif-italic">on the canvas.</span></h1>
      <p>The link may be old, or the page moved. The editor is still exactly where you left it.</p>
      <div className="notfound-actions">
        <Link to="/dashboard" className="btn btn-cobalt">Your designs <EditrimIcon name="arrowRight" size={15} /></Link>
        <Link to="/" className="btn btn-secondary">Back to Editrim</Link>
      </div>
    </div>
  );
}
