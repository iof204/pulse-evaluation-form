export type QuestionKind = "buttons" | "select" | "multi-select";

export type AnswerOption = {
  id: string;
  label: string;
  description: string;
  score?: number;
};

export type EvaluationQuestion = {
  id: number;
  sectionId: number;
  kind: QuestionKind;
  title: string;
  helper?: string;
  answers: AnswerOption[];
};

export const evaluationSections = [
  { id: 1, number: 0, label: "Goals", questionIds: [1, 2, 3] },
  { id: 2, number: 1, label: "Brand", questionIds: [4, 5] },
  { id: 3, number: 2, label: "Audience", questionIds: [6, 7] },
  { id: 4, number: 3, label: "Purpose", questionIds: [8, 9] },
  { id: 5, number: 4, label: "Journey", questionIds: [10, 11] },
  { id: 6, number: 5, label: "Visibility", questionIds: [12, 13] },
  { id: 7, number: 6, label: "Mix", questionIds: [14, 15, 16, 17] },
  { id: 8, number: 7, label: "Retention", questionIds: [18, 19] },
] as const;

const option = (
  id: string,
  label: string,
  description: string,
  score?: number,
): AnswerOption => ({ id, label, description, score });

export const evaluationQuestions: EvaluationQuestion[] = [
  {
    id: 1,
    sectionId: 1,
    kind: "select",
    title: "What do you need your marketing to help with most right now?",
    helper: "Choose the one that feels most important today.",
    answers: [
      option("awareness", "Building awareness", "Getting more of the right people to discover your business and understand what makes it worth remembering. Prioritizing visibility, recognition, and a clearer presence."),
      option("leads", "Generating leads", "Creating more qualified interest and giving people a clear reason to reach out. Prioritizing attention that turns into real inquiries and opportunities."),
      option("sales", "Increasing sales", "Helping more people move from consideration to a purchase, booking, or appointment. Prioritizing conversion and a clear path to action."),
      option("launch", "Supporting a launch", "Introducing something new with enough clarity and momentum to get it moving. Prioritizing a focused message, the right audience, and a coordinated rollout."),
      option("retention", "Improving retention", "Giving customers more reasons to return, stay engaged, and continue choosing your business. Prioritizing the experience after the first sale and the relationships that build loyalty."),
      option("foundation", "Strengthening our foundation", "Making the core pieces of your marketing clearer, more connected, and easier to build on. Prioritizing alignment across your message, audience, goals, and channels."),
      option("consistency", "Becoming more consistent", "Showing up more regularly without your marketing feeling rushed or disconnected. Prioritizing a repeatable rhythm, clearer planning, and a system your team can maintain."),
      option("priorities", "Clarifying our priorities", "Choosing what deserves attention first when several directions feel possible. Prioritizing the work most likely to make your time, budget, and effort matter right now."),
    ],
  },
  {
    id: 2,
    sectionId: 1,
    kind: "select",
    title: "Which best describes how your business works?",
    answers: [
      option("service", "Service-based", "Service-based business."),
      option("product", "Product-based", "Product-based business."),
      option("in-person", "In-person experience", "Retail, restaurant, hospitality, or another in-person experience."),
      option("ecommerce", "E-commerce or online", "E-commerce or online business."),
      option("professional", "Professional practice", "Professional practice or consultancy."),
      option("nonprofit", "Nonprofit or community", "Nonprofit or community organization."),
      option("b2b", "Business-to-business", "Business-to-business company."),
      option("mixed", "A mix", "A mix of a few of these."),
      option("other", "Something else", "Something else entirely."),
    ],
  },
  {
    id: 3,
    sectionId: 1,
    kind: "select",
    title: "Which best describes where your business is today?",
    answers: [
      option("prelaunch", "Getting ready to launch", "We are getting ready to launch."),
      option("new", "Recently launched", "We recently launched and are building momentum."),
      option("growing", "Growing", "We are growing and need our marketing to catch up."),
      option("established", "Established", "We are established but want stronger results."),
      option("rebranding", "Rebranding", "We are rebranding or changing direction."),
      option("expanding", "Expanding", "We are expanding into a new market, product, service, or audience."),
      option("unsure", "Not completely sure", "We are not completely sure—and that is part of why we are here."),
    ],
  },
  {
    id: 4,
    sectionId: 2,
    kind: "buttons",
    title: "Across different marketing touchpoints, how consistent would your core message feel?",
    answers: [
      option("same", "The same core message", "Customers hear the same core message about what we offer, who it is for, and why it matters, even when wording or creative changes by channel.", 4),
      option("familiar", "Mostly familiar", "The general message feels familiar, but some places explain our value more clearly than others.", 3),
      option("pieces", "They piece it together", "Each place tells part of the story, but customers may need to piece it together to understand the bigger picture.", 2),
      option("different", "Different impressions", "Customers may come away with different impressions of what we do depending on where they found us.", 1),
    ],
  },
  {
    id: 5,
    sectionId: 2,
    kind: "buttons",
    title: "If your last five marketing pieces sat side by side, how connected would they look?",
    answers: [
      option("recognizable", "Clearly recognizable", "Recognizably ours—the campaign or channel may look different, but the brand cues, tone, and overall feel stay connected.", 4),
      option("mostly", "Mostly recognizable", "Mostly recognizable, although a few pieces use styles, wording, or templates that feel disconnected.", 3),
      option("depends", "It depends who made them", "It depends on the campaign, channel, partner, vendor, or person who created them.", 2),
      option("disconnected", "They feel disconnected", "There is enough variation that someone might not realize the pieces came from the same business.", 1),
    ],
  },
  {
    id: 6,
    sectionId: 3,
    kind: "buttons",
    title: "How clearly have you identified your primary audience?",
    answers: [
      option("clear", "Clear primary audience", "We have a clear primary audience and understand what matters most to them.", 4),
      option("groups", "Clear, with a few groups", "We know the main audience, but there are a few different customer groups we are also trying to reach.", 4),
      option("several", "Several competing audiences", "We serve several audiences and are not always sure which one should be the main focus.", 3),
      option("broad", "We market broadly", "We tend to market broadly and hope the right people respond.", 1),
    ],
  },
  {
    id: 7,
    sectionId: 3,
    kind: "buttons",
    title: "What usually shapes the messages, offers, or content you put out?",
    answers: [
      option("customers", "Customer insight", "What we hear from customers—their questions, feedback, concerns, conversations, or buying patterns.", 4),
      option("mix", "A thoughtful mix", "A mix of customer feedback, our own experience, and what we are seeing in the market.", 4),
      option("experience", "Our own experience", "Mostly our own experience and what we think customers will respond to.", 3),
      option("urgent", "What is urgent now", "Mostly what the business needs to promote, sell, fill, or announce at the time.", 1),
    ],
  },
  {
    id: 8,
    sectionId: 4,
    kind: "buttons",
    title: "How clear are you on what you want your marketing to accomplish right now?",
    answers: [
      option("one", "One main goal", "We have one main goal, and most of our marketing is built to support it.", 4),
      option("priority", "A few goals, one priority", "We have a few goals we are working toward, and we know which one matters most right now.", 4),
      option("growth", "Growth, but not specific", "We know we want growth or better results, but the specific outcome is not always clear.", 2),
      option("urgent", "Whatever feels urgent", "Our marketing focus tends to change depending on what feels most urgent at the time.", 1),
    ],
  },
  {
    id: 9,
    sectionId: 4,
    kind: "buttons",
    title: "When you share a marketing message, how clear is its purpose?",
    answers: [
      option("defined", "Clearly defined", "We know what the message or campaign is meant to accomplish, and the channel and next step generally support that purpose.", 4),
      option("general", "Generally clear", "We usually know what we want the message to accomplish, but the message, channel, and desired outcome are not always fully planned together.", 3),
      option("help", "It should help somehow", "We want the marketing to help the business, but the specific purpose can be unclear from one message or campaign to the next.", 2),
      option("publish", "Focused on getting it out", "We are usually focused on getting something out there and do not always define what we want it to accomplish beforehand.", 1),
    ],
  },
  {
    id: 10,
    sectionId: 5,
    kind: "buttons",
    title: "How often must you explain your offer or next step to new customers?",
    answers: [
      option("rarely", "Rarely", "Most people already understand the basics and know what their next step is.", 4),
      option("occasionally", "Occasionally", "We answer a few common questions, but the overall offer and process are usually clear.", 3),
      option("often", "Fairly often", "We regularly clarify what we offer, who it is for, key details, or how to move forward.", 2),
      option("very-often", "Very often", "Customers frequently need us to walk them through the basics before they understand what to do next.", 1),
    ],
  },
  {
    id: 11,
    sectionId: 5,
    kind: "buttons",
    title: "How well do you understand where customers hesitate or drop off?",
    answers: [
      option("understand", "We understand the path", "We understand the main steps customers take and where questions, hesitation, or drop-off tend to happen.", 4),
      option("overall", "We know the overall process", "We understand the overall process, but do not always know exactly where or why people lose momentum.", 3),
      option("varies", "The experience varies", "The experience varies by channel or person, making drop-off points harder to identify.", 2),
      option("unsure", "We are not sure", "We are not really sure where people lose momentum between discovering us and taking action.", 1),
    ],
  },
  {
    id: 12,
    sectionId: 6,
    kind: "buttons",
    title: "Before a major marketing effort, what is usually planned?",
    answers: [
      option("core", "Goal, audience, message, channels", "Before a bigger campaign or promotion, we identify the main goal, audience, message, and where we plan to show up.", 4),
      option("main", "The main idea and activities", "We plan the main idea and primary activities in advance, while some details get worked out as the effort unfolds.", 4),
      option("promotion", "What to promote", "We know what we want to promote and choose activities as deadlines, opportunities, or needs come up.", 3),
      option("quick", "Decisions happen quickly", "Most decisions are made quickly when we realize we need more visibility, attendance, leads, or sales.", 1),
    ],
  },
  {
    id: 13,
    sectionId: 6,
    kind: "buttons",
    title: "How do you decide when and where to show up with marketing?",
    answers: [
      option("plan", "A realistic plan", "We follow a realistic plan based on our goals, audience, campaigns, and the channels that make sense for us.", 4),
      option("adjust", "A plan we adjust intentionally", "We intentionally adjust timing and activity around seasonality, launches, business needs, or opportunities.", 4),
      option("specific", "When there is something to promote", "We usually market when we have something specific to promote, announce, fill, or support.", 3),
      option("slow", "When things slow down", "We tend to market when things slow down or when we realize we have not been visible in a while.", 1),
    ],
  },
  {
    id: 14,
    sectionId: 7,
    kind: "multi-select",
    title: "How do people usually find your business?",
    helper: "Select all that apply.",
    answers: [
      option("referrals", "Referrals or word of mouth", "Referrals or word of mouth."),
      option("social", "Social media", "Social media."),
      option("search", "Google or search engines", "Google search or other search engines."),
      option("digital-ads", "Digital advertising", "Digital advertising."),
      option("email", "Email marketing", "Email marketing."),
      option("print", "Print advertising", "Print advertising."),
      option("mail", "Direct mail", "Direct mail."),
      option("outdoor", "Outdoor or billboards", "Outdoor advertising or billboards."),
      option("broadcast", "Radio, TV, or streaming", "Radio, television, streaming audio, or streaming video."),
      option("events", "Events or activations", "Events, trade shows, or community activations."),
      option("partners", "Sponsorships or partnerships", "Sponsorships or partnerships."),
      option("networking", "Networking", "Networking."),
      option("pr", "PR or media coverage", "Public relations or media coverage."),
      option("walk-in", "Walk-in or in-store", "Walk-in traffic or in-store visibility."),
      option("unsure", "We are not sure", "We are not completely sure."),
      option("other", "Something else", "Something else."),
    ],
  },
  {
    id: 15,
    sectionId: 7,
    kind: "multi-select",
    title: "Which marketing channels are currently part of your mix?",
    helper: "Select all that apply.",
    answers: [
      option("social", "Social media", "Social media."),
      option("email", "Email marketing", "Email marketing."),
      option("search", "SEO or Google search", "Search engine optimization or Google search."),
      option("digital-ads", "Digital advertising", "Digital advertising."),
      option("print", "Print advertising", "Print advertising."),
      option("mail", "Direct mail", "Direct mail."),
      option("outdoor", "Outdoor or billboards", "Outdoor advertising or billboards."),
      option("broadcast", "Radio, TV, or streaming", "Radio, television, streaming audio, or streaming video."),
      option("events", "Events or activations", "Events, trade shows, or community activations."),
      option("partners", "Sponsorships or partnerships", "Sponsorships or partnerships."),
      option("networking", "Networking", "Networking."),
      option("loyalty", "Referral or loyalty programs", "Referral or loyalty programs."),
      option("pr", "PR or media outreach", "Public relations or media outreach."),
      option("store", "In-store promotion", "In-store signage or promotional materials."),
      option("word-of-mouth", "Mostly word of mouth", "We mostly rely on word of mouth."),
      option("inactive", "Not consistently marketing", "We are not consistently marketing right now."),
      option("other", "Something else", "Something else."),
    ],
  },
  {
    id: 16,
    sectionId: 7,
    kind: "buttons",
    title: "How well do the different parts of your marketing work together?",
    answers: [
      option("shared", "They support shared goals", "Our channels support the same overall goals, even when message, timing, or format changes by channel.", 4),
      option("purposes", "Each has a clear purpose", "We use different channels for different purposes and generally know how each supports the business.", 4),
      option("separate", "They are managed separately", "We use several channels, but they are usually planned or managed separately without much connection.", 3),
      option("ideas", "We try ideas as they come", "We try different marketing ideas as they come up without a clear plan for how they fit together.", 1),
    ],
  },
  {
    id: 17,
    sectionId: 7,
    kind: "buttons",
    title: "How do you decide what to repeat or change after a marketing effort?",
    answers: [
      option("goal", "Review the goal and outcomes", "We look back at the goal and use available outcomes—such as inquiries, sales, visits, referrals, repeat business, or feedback—to judge whether it helped.", 4),
      option("some", "Review some results", "We review some results and feedback, but it is not always clear which channel, message, partner, or touchpoint made the difference.", 3),
      option("platform", "Rely on platform metrics", "We mostly rely on platform metrics, vendor reports, engagement, reach, impressions, or general customer response.", 2),
      option("felt", "Go by how it felt", "We usually base the decision on how the effort felt because tracking was not clearly set up beforehand.", 1),
    ],
  },
  {
    id: 18,
    sectionId: 8,
    kind: "buttons",
    title: "When someone shows interest, what usually happens next?",
    answers: [
      option("reliable", "A reliable next-step process", "We reliably make sure interested customers receive a clear next step and important opportunities do not get forgotten.", 4),
      option("manual", "Usually guided, partly manual", "We usually respond and guide people forward, but some tracking or follow-up depends on memory or manual reminders.", 3),
      option("varies", "It varies", "The experience varies depending on the channel, location, request, or person handling the interaction.", 2),
      option("inconsistent", "No consistent process", "We may respond or assist, but there is no consistent process to make sure interest keeps moving forward.", 1),
    ],
  },
  {
    id: 19,
    sectionId: 8,
    kind: "buttons",
    title: "After someone becomes a customer, how do you stay connected?",
    answers: [
      option("intentional", "An intentional system", "We intentionally stay connected through follow-up, customer communication, loyalty efforts, or opportunities to return or buy again.", 4),
      option("appropriate", "In ways that fit our business", "We stay connected in ways that make sense for our business and customers, although timing, message, or approach may vary.", 4),
      option("occasionally", "Occasionally", "We stay connected occasionally, usually when we have something relevant to share, promote, or remind customers about.", 3),
      option("none", "No consistent follow-up", "We do not have a consistent way to stay connected after the purchase, visit, booking, or service is complete.", 1),
    ],
  },
];

export function questionIndexForSection(sectionId: number) {
  return evaluationQuestions.findIndex((question) => question.sectionId === sectionId);
}
