import { GitHub } from "@mui/icons-material";
import Twitter from "../icons/Twitter";

export default function Footer() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="py-5 mt-16 text-center border-t border-muted/50 hover:border-muted">
        <p className="text-accent-6">
          A project by{" "}
        <a
          className="font-semibold underline-offset-4 transition-colors hover:underline"
          href="https://github.com/jogeshwar01"
          target="_blank"
          rel="noopener noreferrer"
        >
          Jogeshwar Singh
        </a>
      </p>
      <div className="flex justify-center items-center space-x-4 mt-2">
        <a
          href="https://www.github.com/jogeshwar01/drift-frontend"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2  rounded-full border border-accent-3 bg-black text-white px-6 py-2 transition-all duration-75 transform hover:border-white hover:scale-105"
        >
          <GitHub className="h-6 w-6" />
          <p className="font-medium">jogeshwar01/drift-frontend</p>
        </a>
        <a
          href="https://www.x.com/jogeshwar01"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-2 rounded-full border border-accent-3 bg-white/90 text-black px-6 hover:border-black py-2 transition-all duration-75 transform hover:scale-105"
        >
          <Twitter className="h-5 w-5 " />
          <p className="font-medium">jogeshwar01</p>
          </a>
        </div>
      </div>
    </div>
  );
}
