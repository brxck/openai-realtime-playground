import { Console } from '@/components/Console';
import { Data } from '@/components/Data';

export function Index() {
  return (
    <div className="flex flex-col h-screen overflow-auto">
      <div className="flex flex-col h-full md:flex-row">
        <div className="flex-1 overflow-auto border-r border-gray-200">
          <Data />
        </div>
        <Console />
      </div>
    </div>
  );
}
