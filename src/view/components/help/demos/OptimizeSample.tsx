import * as Preact from "preact";
import { DEFAULT_STATE } from "~/common";
import { OptimizeLevel, OptimizeTrigger } from "~/model";
import { optimize_message } from "~/view/utils";

const optimize_sample =
  "You had seven and a half bags of   cheetos before tonight, don't you think you ate them too fast? ";

export const OptimizeSampleDemo: Preact.FunctionComponent = () => {
  const [optimize_sample_after] = optimize_message(
    optimize_sample,
    { current: null },
    OptimizeTrigger.manual,
    { ...DEFAULT_STATE.settings, optimize_level: OptimizeLevel.max }
  );

  return (
    <div className="help-demo-optimize-sample">
      For example, the message
      <div className="help-demo-optimize-sample-text">
        "{optimize_sample}" ({optimize_sample.length} chars)
      </div>
      would be transformed into the following after optimization:
      <div className="help-demo-optimize-sample-text">
        "{optimize_sample_after}" ({optimize_sample_after.length} chars)
      </div>
    </div>
  );
};
