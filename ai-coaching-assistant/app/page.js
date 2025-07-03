import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center mt-10">AI Coaching Assistant</h1>
      <Button>Click Here</Button>
      <UserButton/>
    </div>
  );
}
