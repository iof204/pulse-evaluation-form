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
    title: "What is the biggest job you need your marketing to do right now?",
    helper: "Choose the one that feels most important today.",
    answers: [
      option("awareness", "Build awareness and help more people discover our business.", "Getting more of the right people to discover your business and understand what makes it worth remembering. Prioritizing visibility, recognition, and a clearer presence."),
      option("leads", "Generate more leads or inquiries.", "Creating more qualified interest and giving people a clear reason to reach out. Prioritizing attention that turns into real inquiries and opportunities."),
      option("sales", "Increase sales, bookings, or appointments.", "Helping more people move from consideration to a purchase, booking, or appointment. Prioritizing conversion and a clear path to action."),
      option("launch", "Launch a new business, product, service, or location.", "Introducing something new with enough clarity and momentum to get it moving. Prioritizing a focused message, the right audience, and a coordinated rollout."),
      option("retention", "Improve customer retention or repeat business.", "Giving customers more reasons to return, stay engaged, and continue choosing your business. Prioritizing the experience after the first sale and the relationships that build loyalty."),
      option("foundation", "Strengthen our overall marketing foundation.", "Making the core pieces of your marketing clearer, more connected, and easier to build on. Prioritizing alignment across your message, audience, goals, and channels."),
      option("consistency", "Become more consistent with our marketing.", "Showing up more regularly without your marketing feeling rushed or disconnected. Prioritizing a repeatable rhythm, clearer planning, and a system your team can maintain."),
      option("priorities", "We have several goals and are not sure what should come first.", "Choosing what deserves attention first when several directions feel possible. Prioritizing the work most likely to make your time, budget, and effort matter right now."),
    ],
  },
  {
    id: 2,
    sectionId: 1,
    kind: "select",
    title: "Which best describes how your business works?",
    answers: [
      option("service", "Service-based business.", "A service-based business earns revenue by providing expertise, labor, access, or an experience rather than primarily selling a physical product. Customers are usually choosing the people, process, and outcome the business can deliver."),
      option("product", "Product-based business.", "A product-based business creates, sources, or manufactures items that customers purchase. Its marketing often helps people understand what the product is, how it solves a need, what makes it different, and where or how to buy it."),
      option("in-person", "Retail, restaurant, hospitality, or another in-person experience.", "This type of business depends heavily on a physical location or face-to-face customer experience. The environment, staff, convenience, service, and on-site experience are often as important as the item being purchased."),
      option("ecommerce", "E-commerce or online business.", "An e-commerce or online business primarily attracts, informs, and converts customers through digital experiences. The website, product information, trust signals, checkout process, fulfillment, and online support all help replace an in-person sales experience."),
      option("professional", "Professional practice or consultancy.", "A professional practice or consultancy sells specialized knowledge, judgment, or advisory support. Customers often need to trust the provider’s credibility and approach before they can fully evaluate the service or decide to engage."),
      option("nonprofit", "Nonprofit or community organization.", "A nonprofit or community organization is organized around a mission, cause, or public benefit. Its marketing may need to reach several groups at once, including participants, donors, volunteers, partners, funders, and the wider community."),
      option("b2b", "Business-to-business company.", "A business-to-business company sells products or services primarily to other organizations. Decisions often involve longer timelines, multiple stakeholders, practical proof of value, and a relationship-building process before a purchase is made."),
      option("mixed", "A mix of a few of these.", "A mixed business model combines more than one way of serving customers or earning revenue—for example, services plus products, online sales plus a physical location, or consumer and business clients. Each part may need a distinct customer path while still feeling like one brand."),
      option("other", "Something else entirely.", "Some businesses operate through a model that does not fit neatly into the common categories listed here. This can include memberships, licensing, marketplaces, subscriptions, franchises, hybrid organizations, or another specialized structure."),
    ],
  },
  {
    id: 3,
    sectionId: 1,
    kind: "select",
    title: "Which best describes where your business is today?",
    answers: [
      option("prelaunch", "We are getting ready to launch.", "The business, offer, or location is still being prepared for the market. Marketing at this stage usually focuses on clarifying the audience and offer, building the core brand foundation, and creating enough awareness and readiness for launch."),
      option("new", "We recently launched and are building momentum.", "The business is now in the market and beginning to learn from real customer response. Marketing at this stage often balances visibility and sales with testing the message, offer, channels, and customer experience."),
      option("growing", "We are growing and need our marketing to catch up.", "The business has gained traction, but its marketing systems, message, capacity, or consistency may not have scaled at the same pace. The work is often about turning informal efforts into a clearer and more repeatable approach."),
      option("established", "We are established but want stronger results.", "The business has history, customers, and an existing market presence, but current marketing is not producing the level or type of results desired. The opportunity may involve refinement, renewed focus, better coordination, or stronger measurement."),
      option("rebranding", "We are rebranding or changing direction.", "The business is changing how it presents itself, what it offers, who it serves, or where it is headed. Marketing needs to help existing and new audiences understand what is changing while preserving the trust and recognition that should carry forward."),
      option("expanding", "We are expanding into a new market, product, service, or audience.", "The business is extending beyond its current footprint or offer. Marketing at this stage must introduce something new clearly while showing how it connects to the value and credibility the business has already built."),
      option("unsure", "We are not completely sure—and that is part of why we are here.", "The business may be experiencing several changes at once, or the main marketing challenge has not yet been clearly defined. This answer simply signals that identifying the current stage and priority is part of the evaluation itself."),
    ],
  },
  {
    id: 4,
    sectionId: 2,
    kind: "buttons",
    title: "If a potential customer came across your business through different marketing touchpoints—such as your website, social media, advertising, signage, sales materials, events, or promotions—how consistent would your core message feel?",
    answers: [
      option("same", "They would hear the same core message about what we offer, who it is for, and why it matters, even if the wording or creative changes by channel.", "Customers hear the same core message about what we offer, who it is for, and why it matters, even when wording or creative changes by channel.", 4),
      option("familiar", "The general message would feel familiar, but some places explain our value more clearly than others.", "The general message feels familiar, but some places explain our value more clearly than others.", 3),
      option("pieces", "Each place tells part of the story, but the customer may need to piece it together to understand the bigger picture.", "Each place tells part of the story, but customers may need to piece it together to understand the bigger picture.", 2),
      option("different", "They may come away with different impressions of what we do depending on where they found us.", "Customers may come away with different impressions of what we do depending on where they found us.", 1),
    ],
  },
  {
    id: 5,
    sectionId: 2,
    kind: "buttons",
    title: "If your last five marketing pieces were placed side by side, how obvious would it be that they came from the same business?",
    answers: [
      option("recognizable", "Recognizably ours—the campaign or channel may look different, but the brand cues, tone, and overall feel stay connected.", "Recognizably ours—the campaign or channel may look different, but the brand cues, tone, and overall feel stay connected.", 4),
      option("mostly", "Mostly recognizable, although a few pieces use styles, wording, or templates that feel disconnected.", "Mostly recognizable, although a few pieces use styles, wording, or templates that feel disconnected.", 3),
      option("depends", "It would depend on the campaign, channel, partner, vendor, or person who created them.", "It depends on the campaign, channel, partner, vendor, or person who created them.", 2),
      option("disconnected", "There would be enough variation that someone might not realize the pieces came from the same business.", "There is enough variation that someone might not realize the pieces came from the same business.", 1),
    ],
  },
  {
    id: 6,
    sectionId: 3,
    kind: "buttons",
    title: "How clearly have you identified your primary audience?",
    answers: [
      option("clear", "Yes — we have a clear primary audience and understand what matters most to them.", "We have a clear primary audience and understand what matters most to them.", 4),
      option("groups", "Mostly — we know the main audience, but there are a few different customer groups we are also trying to reach.", "We know the main audience, but there are a few different customer groups we are also trying to reach.", 4),
      option("several", "Somewhat — we serve several audiences and are not always sure which one should be the main focus.", "We serve several audiences and are not always sure which one should be the main focus.", 3),
      option("broad", "Not really — we tend to market broadly and hope the right people respond.", "We tend to market broadly and hope the right people respond.", 1),
    ],
  },
  {
    id: 7,
    sectionId: 3,
    kind: "buttons",
    title: "What usually helps shape the messages, offers, or content you put out?",
    answers: [
      option("customers", "What we hear from customers — their questions, feedback, concerns, conversations, or buying patterns.", "What we hear from customers—their questions, feedback, concerns, conversations, or buying patterns.", 4),
      option("mix", "A mix of customer feedback, our own experience, and what we are seeing in the market.", "A mix of customer feedback, our own experience, and what we are seeing in the market.", 4),
      option("experience", "Mostly our own experience and what we think customers will respond to.", "Mostly our own experience and what we think customers will respond to.", 3),
      option("urgent", "Mostly what the business needs to promote, sell, fill, or announce at the time.", "Mostly what the business needs to promote, sell, fill, or announce at the time.", 1),
    ],
  },
  {
    id: 8,
    sectionId: 4,
    kind: "buttons",
    title: "How clear are you on what you want your marketing to accomplish right now?",
    answers: [
      option("one", "We have one main goal, and most of our marketing is built to support it.", "We have one main goal, and most of our marketing is built to support it.", 4),
      option("priority", "We have a few goals we are working toward, and we know which one matters most right now.", "We have a few goals we are working toward, and we know which one matters most right now.", 4),
      option("growth", "We know we want growth or better results, but the specific outcome is not always clear.", "We know we want growth or better results, but the specific outcome is not always clear.", 2),
      option("urgent", "Our marketing focus tends to change depending on what feels most urgent at the time.", "Our marketing focus tends to change depending on what feels most urgent at the time.", 1),
    ],
  },
  {
    id: 9,
    sectionId: 4,
    kind: "buttons",
    title: "When you put out a marketing message, how clear are you on what that message is meant to accomplish?",
    answers: [
      option("defined", "We know what the message or campaign is meant to accomplish—whether that is awareness, education, engagement, leads, sales, visits, or another goal—and the channel and next step generally support that purpose.", "We know what the message or campaign is meant to accomplish, and the channel and next step generally support that purpose.", 4),
      option("general", "We usually know what we generally want the message to accomplish, but the connection between the message, channel, and desired outcome is not always fully planned.", "We usually know what we want the message to accomplish, but the message, channel, and desired outcome are not always fully planned together.", 3),
      option("help", "We know we want the marketing to help the business, but the specific purpose can be a little unclear from one message or campaign to the next.", "We want the marketing to help the business, but the specific purpose can be unclear from one message or campaign to the next.", 2),
      option("publish", "We are usually focused on getting something out there and do not always define what we want it to accomplish beforehand.", "We are usually focused on getting something out there and do not always define what we want it to accomplish beforehand.", 1),
    ],
  },
  {
    id: 10,
    sectionId: 5,
    kind: "buttons",
    title: "When new customers first inquire, visit, or reach out, how often do you need to explain what you offer or how to get started?",
    answers: [
      option("rarely", "Rarely—most people already understand the basics and know what their next step is.", "Most people already understand the basics and know what their next step is.", 4),
      option("occasionally", "Occasionally—we answer a few common questions, but the overall offer and process are usually clear.", "We answer a few common questions, but the overall offer and process are usually clear.", 3),
      option("often", "Fairly often—we regularly clarify what we offer, who it is for, key details, or how to move forward.", "We regularly clarify what we offer, who it is for, key details, or how to move forward.", 2),
      option("very-often", "Very often—customers frequently need us to walk them through the basics before they understand what to do next.", "Customers frequently need us to walk them through the basics before they understand what to do next.", 1),
    ],
  },
  {
    id: 11,
    sectionId: 5,
    kind: "buttons",
    title: "Thinking about the path from interest to action, how well do you understand where customers hesitate, ask for help, or drop off?",
    answers: [
      option("understand", "We understand the main steps customers take and have a pretty good sense of where questions, hesitation, or drop-off tend to happen.", "We understand the main steps customers take and where questions, hesitation, or drop-off tend to happen.", 4),
      option("overall", "We understand the overall process, but we do not always know exactly where or why people lose momentum.", "We understand the overall process, but do not always know exactly where or why people lose momentum.", 3),
      option("varies", "Customers can usually move forward, but the experience varies by channel or person, making drop-off points harder to identify.", "The experience varies by channel or person, making drop-off points harder to identify.", 2),
      option("unsure", "We are not really sure where people lose momentum between discovering us and taking action.", "We are not really sure where people lose momentum between discovering us and taking action.", 1),
    ],
  },
  {
    id: 12,
    sectionId: 6,
    kind: "buttons",
    title: "Before launching a campaign, promotion, event, sponsorship, partnership, or major message, what is usually planned?",
    answers: [
      option("core", "Before a bigger campaign or promotion, we usually identify the main goal, audience, message, and where we plan to show up.", "Before a bigger campaign or promotion, we identify the main goal, audience, message, and where we plan to show up.", 4),
      option("main", "We plan the main idea and primary activities in advance, while some details naturally get worked out as the effort unfolds.", "We plan the main idea and primary activities in advance, while some details get worked out as the effort unfolds.", 4),
      option("promotion", "We know what we want to promote and choose the marketing activities as deadlines, opportunities, or needs come up.", "We know what we want to promote and choose activities as deadlines, opportunities, or needs come up.", 3),
      option("quick", "Most decisions are made quickly when we realize we need more visibility, attendance, leads, or sales.", "Most decisions are made quickly when we realize we need more visibility, attendance, leads, or sales.", 1),
    ],
  },
  {
    id: 13,
    sectionId: 6,
    kind: "buttons",
    title: "How does your business decide when and where to show up with marketing?",
    answers: [
      option("plan", "We follow a realistic plan based on our goals, audience, campaigns, and the channels that make the most sense for us.", "We follow a realistic plan based on our goals, audience, campaigns, and the channels that make sense for us.", 4),
      option("adjust", "We have a general plan and intentionally adjust our timing and activity around seasonality, launches, business needs, or opportunities.", "We intentionally adjust timing and activity around seasonality, launches, business needs, or opportunities.", 4),
      option("specific", "We usually market when we have something specific to promote, announce, fill, or support.", "We usually market when we have something specific to promote, announce, fill, or support.", 3),
      option("slow", "We tend to market when things slow down or when we realize we have not been visible in a while.", "We tend to market when things slow down or when we realize we have not been visible in a while.", 1),
    ],
  },
  {
    id: 14,
    sectionId: 7,
    kind: "multi-select",
    title: "How do people usually find your business?",
    helper: "Select all that apply.",
    answers: [
      option("referrals", "Referrals or word of mouth.", "Referrals or word of mouth."),
      option("social", "Social media.", "Social media."),
      option("search", "Google search or other search engines.", "Google search or other search engines."),
      option("digital-ads", "Digital advertising.", "Digital advertising."),
      option("email", "Email marketing.", "Email marketing."),
      option("print", "Print advertising.", "Print advertising."),
      option("mail", "Direct mail.", "Direct mail."),
      option("outdoor", "Outdoor advertising or billboards.", "Outdoor advertising or billboards."),
      option("broadcast", "Radio, television, streaming audio, or streaming video.", "Radio, television, streaming audio, or streaming video."),
      option("events", "Events, trade shows, or community activations.", "Events, trade shows, or community activations."),
      option("partners", "Sponsorships or partnerships.", "Sponsorships or partnerships."),
      option("networking", "Networking.", "Networking."),
      option("pr", "Public relations or media coverage.", "Public relations or media coverage."),
      option("walk-in", "Walk-in traffic or in-store visibility.", "Walk-in traffic or in-store visibility."),
      option("unsure", "We are not completely sure.", "We are not completely sure."),
      option("other", "Something else.", "Something else."),
    ],
  },
  {
    id: 15,
    sectionId: 7,
    kind: "multi-select",
    title: "Which marketing channels are currently part of your mix?",
    helper: "Select all that apply.",
    answers: [
      option("social", "Social media.", "Social media."),
      option("email", "Email marketing.", "Email marketing."),
      option("search", "Search engine optimization or Google search.", "Search engine optimization or Google search."),
      option("digital-ads", "Digital advertising.", "Digital advertising."),
      option("print", "Print advertising.", "Print advertising."),
      option("mail", "Direct mail.", "Direct mail."),
      option("outdoor", "Outdoor advertising or billboards.", "Outdoor advertising or billboards."),
      option("broadcast", "Radio, television, streaming audio, or streaming video.", "Radio, television, streaming audio, or streaming video."),
      option("events", "Events, trade shows, or community activations.", "Events, trade shows, or community activations."),
      option("partners", "Sponsorships or partnerships.", "Sponsorships or partnerships."),
      option("networking", "Networking.", "Networking."),
      option("loyalty", "Referral or loyalty programs.", "Referral or loyalty programs."),
      option("pr", "Public relations or media outreach.", "Public relations or media outreach."),
      option("store", "In-store signage or promotional materials.", "In-store signage or promotional materials."),
      option("word-of-mouth", "We mostly rely on word of mouth.", "We mostly rely on word of mouth."),
      option("inactive", "We are not consistently marketing right now.", "We are not consistently marketing right now."),
      option("other", "Something else.", "Something else."),
    ],
  },
  {
    id: 16,
    sectionId: 7,
    kind: "buttons",
    title: "How well do the different parts of your marketing work together?",
    answers: [
      option("shared", "Our marketing channels support the same overall goals, even though the message, timing, or format may change depending on the channel.", "Our channels support the same overall goals, even when message, timing, or format changes by channel.", 4),
      option("purposes", "We use different channels for different purposes, and we generally know how each one supports the business.", "We use different channels for different purposes and generally know how each supports the business.", 4),
      option("separate", "We use several marketing channels, but they are usually planned or managed separately without much connection between them.", "We use several channels, but they are usually planned or managed separately without much connection.", 3),
      option("ideas", "We tend to try different marketing ideas as they come up without a clear plan for how they fit together.", "We try different marketing ideas as they come up without a clear plan for how they fit together.", 1),
    ],
  },
  {
    id: 17,
    sectionId: 7,
    kind: "buttons",
    title: "After a marketing effort wraps up, how do you usually decide what to repeat, adjust, or try differently next time?",
    answers: [
      option("goal", "We look back at the goal and use the information available—such as inquiries, sales, bookings, visits, redemptions, attendance, referrals, repeat business, or customer feedback—to judge whether the effort helped.", "We look back at the goal and use available outcomes—such as inquiries, sales, visits, referrals, repeat business, or feedback—to judge whether it helped.", 4),
      option("some", "We review some results and feedback, but it is not always clear which channel, message, partner, or touchpoint made the difference.", "We review some results and feedback, but it is not always clear which channel, message, partner, or touchpoint made the difference.", 3),
      option("platform", "We mostly rely on platform metrics, vendor or partner reports, engagement, reach, impressions, or general customer response.", "We mostly rely on platform metrics, vendor reports, engagement, reach, impressions, or general customer response.", 2),
      option("felt", "We usually base the decision on how the effort felt because tracking was not clearly set up beforehand.", "We usually base the decision on how the effort felt because tracking was not clearly set up beforehand.", 1),
    ],
  },
  {
    id: 18,
    sectionId: 8,
    kind: "buttons",
    title: "When someone shows interest—by calling, messaging, visiting, clicking, requesting information, or beginning a purchase—what usually happens next?",
    answers: [
      option("reliable", "We have a reliable way to make sure interested customers receive a clear next step and important inquiries or opportunities do not get forgotten.", "We reliably make sure interested customers receive a clear next step and important opportunities do not get forgotten.", 4),
      option("manual", "We usually respond and guide people forward, but some tracking or follow-up still depends on memory or manual reminders.", "We usually respond and guide people forward, but some tracking or follow-up depends on memory or manual reminders.", 3),
      option("varies", "The experience varies depending on the channel, location, request, or person handling the interaction.", "The experience varies depending on the channel, location, request, or person handling the interaction.", 2),
      option("inconsistent", "We may respond or assist, but there is no consistent process to make sure interest keeps moving forward.", "We may respond or assist, but there is no consistent process to make sure interest keeps moving forward.", 1),
    ],
  },
  {
    id: 19,
    sectionId: 8,
    kind: "buttons",
    title: "After someone becomes a customer, how does your business usually stay connected with them?",
    answers: [
      option("intentional", "We have an intentional way to stay connected, such as follow-up, customer communication, loyalty efforts, or opportunities to return or buy again.", "We intentionally stay connected through follow-up, customer communication, loyalty efforts, or opportunities to return or buy again.", 4),
      option("appropriate", "We stay connected in ways that make sense for our business and customers, although the timing, message, or approach may vary.", "We stay connected in ways that make sense for our business and customers, although timing, message, or approach may vary.", 4),
      option("occasionally", "We reach back out or stay connected occasionally, usually when we have something relelvant to share, promote, or remind customers about.", "We stay connected occasionally, usually when we have something relevant to share, promote, or remind customers about.", 3),
      option("none", "We do not really have a consistent way to stay connected after the purchase, visit, booking, or service is complete", "We do not have a consistent way to stay connected after the purchase, visit, booking, or service is complete.", 1),
    ],
  },
];

export function questionIndexForSection(sectionId: number) {
  return evaluationQuestions.findIndex((question) => question.sectionId === sectionId);
}
