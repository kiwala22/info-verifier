/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { queryActions } from "./actions";
import { IHashMapGeneric } from "@/types";
import { cn, toDotNotation } from "@/lib/utils";
import startCase from "lodash/startCase";
import omit from "lodash/omit";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  query: z.string().min(1, "Query is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function QueryForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [apiResponse, setApiResponse] = useState<IHashMapGeneric<unknown>>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: FormData) {
    try {
      const response = await queryActions.query(values.query);

      setApiResponse(response);
      setIsDialogOpen(true);
    } catch (error: any) {
      setApiResponse({ message: error.message });
      setIsDialogOpen(true);
    }
  }

  const data = useMemo(() => {
    if (apiResponse) {
      const obj = omit(apiResponse, ["photo"]);

      return Object.entries(toDotNotation(obj)).map(([key, value]) => ({
        label: startCase(key),
        key,
        value:
          typeof value === "object" ? JSON.stringify(value) : String(value),
      }));
    }
  }, [apiResponse]);

  return (
    <div className="container mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Lookup</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Query</FormLabel>
                <FormControl>
                  <Input placeholder="Enter query" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="animate-spin mr-2" />
            )}
            {form.formState.isSubmitting ? "Please wait..." : "Submit"}
          </Button>
        </form>
      </Form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Response</DialogTitle>
          </DialogHeader>

          <Separator />

          {data && data.length > 0 ? (
            <div
              className={cn("grid w-full gap-4", {
                "sm:grid-cols-2": !!apiResponse?.photo,
              })}
            >
              {apiResponse?.photo ? (
                <div className="w-full relative pt-[100%]">
                  <Image
                    src={
                      apiResponse?.photo
                        ? `data:image/png;base64,${apiResponse.photo}`
                        : "https://ui.shadcn.com/placeholder.svg"
                    }
                    alt="photo"
                    objectFit="cover"
                    fill
                    className="w-full h-full top-0 left-0 object-cover rounded-2xl border shadow-lg"
                  />
                </div>
              ) : (
                <></>
              )}

              <div className="flex flex-col justify-center max-sm:items-center text-secondary-foreground gap-6">
                {data.map((item, index) => (
                  <div
                    className="flex flex-col md:flex-row gap-2 justify-between border-b pb-2"
                    key={index}
                  >
                    <div className="font-medium">{item.label}</div>
                    <div className="text-muted-foreground break-all w-80 md:break-normal md:w-auto">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground"> No Data found</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
