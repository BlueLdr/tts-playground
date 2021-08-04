import * as Preact from "preact";
import { REPOSITORY_URL } from "~/common";

export const Footer: Preact.FunctionComponent = () => (
  <footer className="footer">
    <a
      href={`${REPOSITORY_URL}/issues/new?template=bug_report.yml`}
      target="_blank"
    >
      Report an Issue
    </a>
    <span />
    <a
      href={`${REPOSITORY_URL}/issues/new?template=feature_request.md`}
      target="_blank"
    >
      Give Feedback
    </a>
  </footer>
);
