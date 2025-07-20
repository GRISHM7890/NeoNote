"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { Slot } from "@radix-ui/react-slot";

const Root = CollapsiblePrimitive.Root

const Trigger = CollapsiblePrimitive.CollapsibleTrigger

const Content = CollapsiblePrimitive.CollapsibleContent;


const Collapsible = Object.assign(Root, {
    Trigger,
    Content,
    // Note: The following are not exported from the main entry point.
    // They are available for use in other components.
    // But are not exported from this file.
    // This is to avoid polluting the public API.
    // @ts-ignore
    __Trigger: Trigger,
    // @ts-ignore
    __Content: Content,
    // @ts-ignore
    __Root: Root,
    // @ts-ignore
    __Slot: Slot,
});

export { Collapsible, Trigger as CollapsibleTrigger, Content as CollapsibleContent }
