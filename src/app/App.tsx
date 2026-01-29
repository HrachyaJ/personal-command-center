import { Button } from "../shared/ui/button";
import { Input } from "../shared/ui/input";

function App() {
  return (
    <div>
      <h1>Hello World!</h1>
      <div>
        <Button variant="outline" className="cursor-pointer">
          Button
        </Button>
        <br />
        <Input placeholder="Input" className="w-1/5" />
      </div>
    </div>
  );
}

export default App;
