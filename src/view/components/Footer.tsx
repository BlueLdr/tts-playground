import * as Preact from "preact";
import { REPOSITORY_URL } from "~/common";
import { useStateIfMounted } from "~/view/utils";

const prev_version = localStorage.getItem("tts-release-viewed");
const cur_version = process.env.TTS_VERSION;

export const Footer: Preact.FunctionComponent = () => {
  const [ver_changed, set_ver_changed] = useStateIfMounted(
    prev_version !== cur_version
  );
  return (
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
      {cur_version && (
        <Preact.Fragment>
          <span />
          <a
            className="footer-release"
            target="_blank"
            href={`${REPOSITORY_URL}/releases`}
            onClick={
              ver_changed
                ? () => {
                    localStorage.setItem("tts-release-viewed", cur_version);
                    set_ver_changed(false);
                  }
                : undefined
            }
          >
            <span>Release Notes</span>
            {ver_changed && (
              <span className="footer-release-new">
                New
                <i className="fas fa-exclamation" />
              </span>
            )}
          </a>
        </Preact.Fragment>
      )}
    </footer>
  );
};
