import type { ResultLevel, ResultSectionKey } from "../app/resultsData";

export type DetailedResultCopy = {
  seeing: string;
  matters: string;
  reflection: string;
  toolTip?: string;
};

export const detailedResultCopy: Record<
  ResultSectionKey,
  Record<ResultLevel, DetailedResultCopy>
> = {
  brand: {
    strong: {
      seeing: "Your results suggest that the core of your brand stays recognizable even when your marketing changes by channel, campaign, format, or creative approach. People are likely getting a fairly consistent picture of what your business offers and what it stands for.",
      matters: "Consistency helps people connect the dots between the different places they encounter your business. Over time, that can make your brand easier to understand, recognize, remember, and trust.",
      reflection: 'As your business grows or your marketing expands into new places, which parts of your message and brand experience should remain unmistakably "you"?',
    },
    building: {
      seeing: "The foundation of your brand appears to be there, but it may not come through with the same clarity everywhere. Some messages or marketing pieces may communicate your value really well, while others feel less connected to the bigger brand story.",
      matters: "A little variation is normal. But when those differences start adding up, customers may have to work harder to understand how everything connects - making a good business feel less distinct or memorable than it actually is.",
      reflection: "If someone encountered your business in three different places this week, what would you hope they consistently understand or remember about you?",
    },
    "needs-love": {
      seeing: "Your results suggest that different parts of your marketing may be creating different impressions of the business. Your core message, brand cues, tone, or overall experience may not always be reinforcing the same bigger picture.",
      matters: "When customers have to piece together what a business does or why it matters, the marketing itself has to work harder. Even strong individual campaigns can lose impact when the brand underneath them does not feel clear or connected.",
      reflection: "If your business name and logo disappeared from your current marketing, would someone still recognize that those pieces came from the same business?",
    },
  },
  audience: {
    strong: {
      seeing: "You appear to have a clear sense of your primary audience and regularly use what you know about customers to help shape your marketing. You may serve different customer groups, but there is still a meaningful understanding of who matters most and what matters to them.",
      matters: "The clearer your audience understanding is, the easier it becomes for marketing to feel relevant instead of generic. That gives the right people a better chance of recognizing that your business may actually be for them.",
      reflection: "What have your customers been telling you - through their questions, feedback, behaviors, or buying decisions - that may be worth paying attention to?",
    },
    building: {
      seeing: "You likely know your customers on a general level, but your focus may sometimes stretch across several groups or rely more heavily on experience and assumptions than direct customer insight.",
      matters: "Marketing can still work with a broader audience, but the more the message has to speak to everyone, the easier it becomes for some of its relevance and specificity to get diluted.",
      reflection: "When you make marketing decisions today, how much of what you put out is shaped by what customers are actually showing or telling you?",
      toolTip: "If you already have customer feedback, reviews, FAQs, or other real-world input, AI-assisted tools can help organize that information and surface recurring themes. The insight should still come from your actual customers - the tool can simply make the patterns easier to see.",
    },
    "needs-love": {
      seeing: 'Your marketing may be trying to speak broadly without enough clarity around who matters most - or may be shaped more by what the business needs to say than by what customers are actually telling you.',
      matters: 'When audience focus and customer insight are limited, messaging can become broader and easier to overlook, making it harder for the right person to immediately recognize, "This is for me."',
      reflection: "If you could only speak to one type of customer with your next important marketing message, who would most need to hear it - and why?",
    },
  },
  goals: {
    strong: {
      seeing: "Your marketing appears to have a clear job to do. You generally know what you are trying to accomplish and have enough clarity to connect individual messages or campaigns back to a larger goal.",
      matters: 'When marketing has a defined purpose, activity becomes easier to evaluate. You are not simply asking, "Did we put something out?" - you have a clearer sense of what the effort was meant to contribute.',
      reflection: "If someone asked what your marketing is expected to accomplish for the business over the next few months, how quickly could you answer?",
    },
    building: {
      seeing: "You have meaningful business goals in mind, but the purpose behind individual marketing efforts may not always be fully defined or prioritized before the work begins.",
      matters: "When the desired outcome is fuzzy, it becomes harder to know whether a marketing effort truly helped - even if the campaign itself looked good or generated activity.",
      reflection: "Before your next meaningful marketing effort goes out, could the people working on it clearly explain what you want it to accomplish?",
    },
    "needs-love": {
      seeing: "Your marketing may be driven more by what feels urgent in the moment than by a clearly defined outcome. That can make marketing feel like a series of tasks rather than one connected business tool.",
      matters: "Without a clear purpose, it becomes harder to decide what deserves attention, what success should look like, or whether the effort actually supported the business.",
      reflection: "Are you currently doing marketing because you know what you want it to achieve - or because you know you need to be doing something?",
    },
  },
  journey: {
    strong: {
      seeing: "Customers appear to understand the basics of your business and can generally move forward without excessive explanation. You also seem to have a good sense of where questions, hesitation, or drop-off tend to happen along the way.",
      matters: "Understanding both how customers move forward and where they may lose momentum gives you a clearer view of the experience your marketing is creating - not just the message you are putting out.",
      reflection: "Where in the customer journey do people tend to need the most reassurance or clarification, even when the overall process is working well?",
    },
    building: {
      seeing: "The customer experience appears to be mostly working, but there may be a few places where customers need additional explanation or where hesitation is harder to pinpoint.",
      matters: "Small moments of friction can quietly slow down decisions or action, especially when someone is interested but not fully confident about what happens next.",
      reflection: "What questions or points of hesitation seem to come up repeatedly before customers decide to move forward?",
    },
    "needs-love": {
      seeing: "Customers may regularly need extra explanation to understand the offer or know what to do next, while the places where people hesitate or lose momentum may not always be easy to identify.",
      matters: "When the path forward is unclear - and you are not sure where the friction is happening - potential customers can lose momentum before taking the next step.",
      reflection: "Where do you find yourself explaining the same basic information over and over again?",
    },
  },
  campaign: {
    strong: {
      seeing: "Your visibility appears to be intentional. Whether your marketing is ongoing, seasonal, campaign-based, or tied to specific business cycles, there seems to be thought behind when you show up and what those efforts are meant to support.",
      matters: "Intentional visibility makes it easier for marketing activity to serve a purpose instead of simply filling space. It can also make the workload itself feel more manageable because not every decision has to start from scratch.",
      reflection: "Looking a few months ahead, do you know which business priorities, promotions, events, or seasonal moments your marketing will need to support?",
    },
    building: {
      seeing: "You are getting the business out there, but some planning may happen closer to the moment than you would like. Opportunities, deadlines, promotions, or business needs may sometimes determine the marketing schedule for you.",
      matters: "This can still get the job done, but it can make marketing feel harder to sustain, more overwhelming to manage, and more difficult to learn from over time.",
      reflection: "How often does marketing feel like something you are getting ahead of versus something you are trying to catch up with?",
      toolTip: "If keeping up with marketing is part of the challenge, AI or other planning tools may help lighten the load - from organizing ideas to outlining content or planning ahead. The goal isn't to create more marketing; it's to make the marketing you've already decided matters easier to manage.",
    },
    "needs-love": {
      seeing: "Your marketing may be relying heavily on urgency - showing up when something needs attention, business slows down, or there is an immediate need to generate visibility.",
      matters: "Reactive marketing can create a cycle where visibility increases only when the business needs something right away, making it harder to build momentum or see patterns in what is actually helping.",
      reflection: "If business suddenly got busy tomorrow, would your marketing keep moving - or disappear until things slowed down again?",
      toolTip: "When marketing feels constantly reactive, the right tools can help create a little breathing room. But they work best once you're clear on what you're trying to accomplish, who you're trying to reach, and what actually needs to be planned.",
    },
  },
  mix: {
    strong: {
      seeing: "The different parts of your marketing appear to have a purpose, even when individual channels play different roles. You also have some way of looking back at results to understand whether the effort helped support the business.",
      matters: "When the different parts of your marketing have a clear role and work together intentionally, it becomes easier to see how they support the business. Reviewing the results then helps you make more informed decisions about what is worth repeating, adjusting, or rethinking.",
      reflection: "Looking across the different ways you market your business, can you clearly explain what role each one plays - and what results or feedback help you decide whether to keep it, adjust it, or try something different?",
    },
    building: {
      seeing: "You are using multiple marketing channels or activities, and you are gathering some information from the results. However, the role each effort plays may not always feel fully connected to the bigger picture, and it may still be difficult to tell which efforts are truly helping the business.",
      matters: "When marketing activities are planned or evaluated separately, it becomes harder to understand how they work together - and harder to know what is worth repeating, adjusting, or rethinking based on the results.",
      reflection: "Looking across the different ways you market your business, can you clearly explain why you are using each one, what tells you whether it is helping, and where it makes sense to continue, adjust, or rethink your efforts?",
      toolTip: "If your marketing results live in several different places, AI-assisted tools may help organize information, summarize what happened, or surface patterns that are easy to miss. The key is starting with real business data and knowing what you're trying to learn from it.",
    },
    "needs-love": {
      seeing: "Your marketing may consist of separate tactics, opportunities, or channels without a clear sense of how they support one another - and it may also be difficult to tell which efforts are truly helping the business.",
      matters: "When the different parts of your marketing are not clearly connected and the results are hard to evaluate, it becomes harder to know what is worth continuing, adjusting, or rethinking. That can lead to time, energy, and resources being spent without enough clarity about what is actually contributing.",
      reflection: "Looking across the different ways you market your business, which efforts are hardest to explain in terms of both why you are using them and what tells you whether they are helping?",
      toolTip: "Technology can make marketing measurement easier, but it can't fix unclear goals or missing information. Getting clearer on what you want to learn from your marketing will make any analytics, automation, or AI tool much more useful.",
    },
  },
  retention: {
    strong: {
      seeing: "Your business appears to have a reliable way to move interested customers forward and continue the relationship after the initial purchase, visit, booking, or service. Follow-through may look different depending on the situation, but it does not seem to be left entirely to chance.",
      matters: "Marketing does not stop once someone shows interest - or even after they become a customer. Clear follow-through can help keep opportunities moving forward, while staying connected can strengthen relationships and create more potential for future business.",
      reflection: "Once someone shows interest, how intentionally do you guide them toward the next step - and after they become a customer, how intentionally do you stay connected?",
    },
    building: {
      seeing: "Your follow-through generally seems to work, but parts of the experience may still depend on timing, manual effort, or who is handling the interaction. After someone becomes a customer, staying connected may also happen inconsistently or mainly when there is a specific reason to reach back out.",
      matters: "When follow-through is inconsistent, interested customers can occasionally lose momentum before taking the next step - and existing customer relationships may become quieter than intended after the initial transaction.",
      reflection: "Where is the relationship most likely to lose momentum for your business - after someone first shows interest, after they become a customer, or later when there may be an opportunity to reconnect?",
      toolTip: "If follow-up depends heavily on memory or manual effort, automation and AI-assisted tools may be able to support parts of the process. The goal isn't to make customer relationships feel automated - it's to make it harder for good opportunities or existing relationships to quietly fall through the cracks.",
    },
    "needs-love": {
      seeing: "Some opportunities may be losing momentum between initial interest and the next step, while the relationship with existing customers may also become quieter once the initial purchase, visit, booking, or service is complete.",
      matters: "Marketing does not stop once someone shows interest - or even after they become a customer. Clear follow-through can help keep opportunities moving forward, while staying connected can strengthen relationships and create more potential for future business.",
      reflection: "How much of your current marketing energy goes toward finding new customers compared with maintaining the relationships you have already created?",
      toolTip: "Tools can help with reminders, follow-up, and staying connected, but first get clear on what you want the customer experience to look like. Once that's defined, technology can support the process instead of defining it.",
    },
  },
};

export const detailedIndustryLens: Record<ResultSectionKey, string> = {
  brand: "Brand consistency does not have to look identical across every business or channel. A customer may experience a retailer through advertising, signage, promotions, and an in-person visit, while a professional service business may rely more heavily on conversations, proposals, digital presence, and referrals. The goal is not sameness - it is a recognizable thread connecting the experience.",
  audience: "Audience clarity can look very different depending on the business. Some companies have one highly defined customer group, while others legitimately serve several audiences with different needs. The goal is not always to narrow down to one type of person - it is to understand who you are speaking to well enough for the marketing to feel intentional.",
  goals: "Not every marketing effort needs to drive an immediate sale. Depending on the business and the customer journey, the goal may be awareness, education, engagement, inquiries, visits, bookings, sales, retention, or something else entirely. What matters is knowing the job the marketing is meant to do.",
  journey: "A customer journey can be quick or complex. Buying a product, choosing a restaurant, booking a service, selecting a professional provider, or making a B2B decision can all involve very different levels of research and consideration. A healthy journey is not necessarily the shortest one - it is one that makes sense for the decision the customer is being asked to make.",
  campaign: "Consistency does not mean every business should market at the same frequency. Seasonal businesses, event-driven companies, professional services, retailers, restaurants, and B2B organizations can all have very different rhythms. The important distinction is whether that rhythm is intentional or simply reactive.",
  mix: "Different marketing channels can play very different roles depending on the business, customer journey, and goal. A referral partnership, event, billboard, email campaign, social effort, sales conversation, or other activity may contribute in different ways. The goal is not perfect attribution - it is having enough clarity about the role each effort plays and enough information to make thoughtful decisions about what to continue, adjust, or rethink.",
  retention: "Customer relationships naturally have different rhythms. A restaurant or retailer may see repeat purchases frequently, while a consultant, real estate professional, contractor, or B2B provider may have much longer gaps between transactions. Staying connected does not have to mean constant communication - it means having an intentional relationship beyond the initial interaction when it makes sense.",
};

export const detailedSectionReminder: Record<ResultSectionKey, string> = {
  brand: "How clearly and consistently your business comes across wherever people encounter it.",
  audience: "How clearly your marketing is shaped around the people you most want to reach.",
  goals: "How intentionally your marketing is connected to what you want it to accomplish.",
  journey: "How easily people can understand your business and move from interest to action.",
  campaign: "How intentionally you plan when, where, and why your business shows up.",
  mix: "How well your marketing activities work together and help you learn what is working.",
  retention: "How well your business turns interest into action - and stays connected after someone becomes a customer.",
};
