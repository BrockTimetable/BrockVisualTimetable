import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { submitFeedback } from "@/lib/generator/fetchData";
import eventBus from "@/lib/eventBus";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "question", label: "Question" },
  { value: "general", label: "General feedback" },
  { value: "other", label: "Other" },
];

const EMPTY_FORM = {
  type: "general",
  name: "",
  email: "",
  subject: "",
  message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FeedbackDialog({ open, onOpenChange }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [messageError, setMessageError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setMessageError("");
      setEmailError("");
      setIsSubmitting(false);
    }
  }, [open]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "message" && messageError) {
      setMessageError("");
    }
    if (field === "email" && emailError) {
      setEmailError("");
    }
  };

  const validate = () => {
    let valid = true;

    if (!form.message.trim()) {
      setMessageError("Message is required.");
      valid = false;
    }

    const trimmedEmail = form.email.trim();
    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    return valid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        type: form.type,
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        page: window.location.href,
      });

      eventBus.emit("snackbar", {
        message: "Thanks for your feedback!",
        variant: "success",
      });
      onOpenChange(false);
    } catch (error) {
      const apiError = error.response?.data?.error;
      eventBus.emit("snackbar", {
        message: apiError || "Failed to submit feedback. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Report a bug, suggest a feature, or share general feedback about
            brocktimetable.com.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="feedback-type"
            >
              Type
            </label>
            <Select
              value={form.type}
              onValueChange={(value) => updateField("type", value)}
            >
              <SelectTrigger id="feedback-type" aria-label="Feedback type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {FEEDBACK_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="feedback-name"
              >
                Name
              </label>
              <Input
                id="feedback-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Optional"
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="feedback-email"
              >
                Email
              </label>
              <Input
                id="feedback-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="Optional"
                aria-invalid={!!emailError}
                aria-describedby="feedback-email-helper"
              />
              {emailError ? (
                <p
                  id="feedback-email-helper"
                  className="text-xs text-destructive"
                >
                  {emailError}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="feedback-subject"
            >
              Subject
            </label>
            <Input
              id="feedback-subject"
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Optional"
              maxLength={200}
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="feedback-message"
            >
              Message
            </label>
            <textarea
              id="feedback-message"
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              placeholder="What would you like to share?"
              rows={4}
              maxLength={5000}
              aria-invalid={!!messageError}
              aria-describedby="feedback-message-helper"
              className={cn(
                "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />
            <p
              id="feedback-message-helper"
              className={cn(
                "text-xs",
                messageError ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {messageError || "Required"}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

FeedbackDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
};
