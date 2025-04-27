import { GitHub, X } from "@mui/icons-material";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export default function Footer() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-5 mt-16 text-center border-t border-muted/50 hover:border-muted">
        <div className="flex items-center justify-center space-x-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="link"
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => {
                  window.open("https://github.com/jogeshwar01", "_blank");
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://github.com/jogeshwar01.png" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <span className="font-medium text-lg">jogeshwar01</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-96">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-18 w-18">
                  <AvatarImage src="https://github.com/jogeshwar01.png" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h4 className="text-lg font-semibold">@jogeshwar01</h4>
                  <p className="text-base">Software Engineer - Solana - Web3</p>
                  <div className="flex items-center justify-center pt-2 pb-2 space-x-6">
                    <a
                      href="https://github.com/jogeshwar01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-base text-muted-foreground hover:text-foreground"
                    >
                      <GitHub className="mr-2 h-5 w-5" />
                      GitHub
                    </a>
                    <a
                      href="https://twitter.com/jogeshwar01"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-base text-muted-foreground hover:text-foreground"
                    >
                      <X className="mr-2 h-5 w-5" />
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <div>
            <a
              href="https://www.github.com/jogeshwar01/drift-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 text-lg px-6 py-2 hover:underline"
            >
              <GitHub className="h-6 w-6" />
              <p className="font-medium">jogeshwar01/drift-frontend</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
