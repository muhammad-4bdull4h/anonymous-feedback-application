"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

function Page() {
  const { username } = useParams();
  const [loader, setLoader] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState(
    "What's your favorite movie?||Do you have any pets?||What's your dream job?"
  );
  const [suggestLoader, setSuggestLoader] = useState(false);

  const suggestedMessagesParser = (messageString: string): string[] => {
    return messageString.split("||");
  };

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const fetechSuggestedMessages = async () => {
    // fetch suggested messages from server
    setSuggestLoader(true);
    try {
      const res = await axios.get("/api/suggest-message");
      if (res.data.success) {
        setSuggestedMessages(res.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSuggestLoader(false);
    }
  };

  const messageContent = form.watch("content");

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    // send message to server
    try {
      setLoader(true);
      const res = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      if (res.data?.success) {
        toast({
          title: "Message sent successfully",
        });
      }
      form.reset({ ...form, content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: axiosError?.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setLoader(false);
    }
  };

  const onMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  return (
    <div className="">
      <h1 className="text-center text-3xl font-bold mt-10 p-2">
        Public profile link
      </h1>
      <section className="w-[90vw] mx-auto sm:w-[70vw]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Anonymous messages to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your text here"
                      className="resize none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              {loader ? (
                <Button className="mt-10 " disabled>
                  {" "}
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait{" "}
                </Button>
              ) : (
                <Button
                  className="mt-10 "
                  type="submit"
                  disabled={loader || !messageContent}
                >
                  Send
                </Button>
              )}
            </div>
          </form>
        </Form>
      </section>
      <section className="w-[90vw] mx-auto sm:w-[70vw] mt-7">
        <div className="flex justify-center my-3 sm:justify-start">
          <Button disabled={suggestLoader} onClick={fetechSuggestedMessages}>
            Suggest Message
          </Button>
        </div>
        <p>Click on any message below to select it.</p>
        <div className="mt-3">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Messeges</h3>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              {suggestedMessagesParser(suggestedMessages).map(
                (message, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    onClick={() => onMessageClick(message)}
                    className="mb-2"
                  >
                    {message}
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="w-[90vw] flex justify-center items-center gap-4 my-10 flex-col mx-auto sm:w-[70vw] mt-7">
        <p>Get your message board</p>
        <Link href={"/sign-up"}>
          <Button>Create your account</Button>
        </Link>
      </section>
    </div>
  );
}

export default Page;
