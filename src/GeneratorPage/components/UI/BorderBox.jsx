import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";

export default function BorderBox({ title, children }) {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="border-box"
      className="my-0 ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] w-screen overflow-hidden rounded-none border-b border-primary sm:my-0 sm:ml-0 sm:mr-0 sm:w-full sm:rounded-lg sm:border"
    >
      <AccordionItem value="border-box" className="border-none">
        <AccordionTrigger className="bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:no-underline [&>svg]:text-primary-foreground [&>svg]:shrink-0 [&[data-state=open]>svg]:rotate-180">
          <span>{title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
