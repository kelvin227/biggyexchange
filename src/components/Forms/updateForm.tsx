/* eslint-disable */
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Label } from '../ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateUserProfile } from '@/functions/user'

const UpdateForm = ({ email, field }: { email: string; field: "username" | "name" | "phoneNo"}) => {
  const router = useRouter();

  const [signinFormData, setSigninFormData] = useState([
    {
      name: field, // Dynamically set the field name
      type: "text",
      placeHolder: field === "username" ? "johndoe" : field === "name"? "John Doe": field === "phoneNo"? "+977 AB YXX XXX" :"John Doe" ,
      label: field === "username" ? "johndoe" : field === "name"? "John Doe": field === "phoneNo"? "Phone Number" :"John Doe",
    },
  ]);

  const SigninformSchema = z.object({
    [field]: z.string().min(1, `${field} cannot be empty`).regex(/^\S+$/, "Spaces are not allowed"),
  });

  const signinForm = useForm<z.infer<typeof SigninformSchema>>({
    resolver: zodResolver(SigninformSchema),
    defaultValues: {
      [field]: "",
    },
  });

  const handleSignInForm = async (data: z.infer<typeof SigninformSchema>) => {
    const input = data[field];

    // Call the updateUserProfile function with the email, input, and field
    const response = await updateUserProfile(email, input, field);

    if (response.success) {
      toast(response.message);
      router.refresh();
    } else {
      toast(response.message);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger className="">
          <div className="flex items-center gap-2 rounded-md bg-black p-3">
            <Label className="text-sm font-semibold text-white">Edit</Label>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit your {field}</DialogTitle>
          </DialogHeader>
          <Form {...signinForm}>
            <form onSubmit={signinForm.handleSubmit(handleSignInForm)}>
              {signinFormData.map((formField, index) => (
                <FormField
                  key={index}
                  name={formField.name as "username" | "name"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs">{formField.label}</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-full text-md bg-gray-200/80 p-6"
                          type={formField.type}
                          placeholder={formField.placeHolder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button
                size={"lg"}
                className="rounded-full py-6 bg-linear-[135deg,#f75959_0%,#f35587_100%] cursor-pointer"
                type="submit"
              >
                Save
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateForm;