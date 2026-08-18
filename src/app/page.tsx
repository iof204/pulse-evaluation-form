import EvaluationPage from "./EvaluationPage";
import V2EvaluationPage from "./V2EvaluationPage";

export default function Home() {
  if (process.env.NEXT_PUBLIC_APP_VERSION === "v2") {
    return <V2EvaluationPage />;
  }

  return <EvaluationPage />;
}
