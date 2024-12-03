import { Index } from './pages/index';
import { Inspector } from 'tinybase/ui-react-inspector';
import { store, ReactStore } from './store';

function App() {
  return (
    <ReactStore.Provider store={store}>
      <div className="w-full h-full">
        <Index />
      </div>
      <Inspector />
    </ReactStore.Provider>
  );
}

export default App;
