import TailwindAdvancedEditor from "@/components/tailwind/advanced-editor";
import Menu from "@/components/tailwind/ui/menu";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      <Menu className="absolute left-1 top-1" />
      <TailwindAdvancedEditor />
    </div>
  );
}
