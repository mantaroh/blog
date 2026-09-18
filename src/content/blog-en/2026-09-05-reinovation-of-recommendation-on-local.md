---
title: Re:Inovation of Recommendation on local.
description: |-
  YouTube and social media recommendations infer things based on personal information.
  I want to block my personal information and control things myself, so recommendations don't work very well for me. That's why I'm trying to build a recommendation system that operates locally and remains closed to my own environment.
pubDate: 2026-09-06
draft: false
tags:
  - Recommendation
---
## Reinventing the Wheel

Recently, I noticed that the videos I watch on YouTube have become almost completely fixed.

Of course, I enjoy watching them because they are all videos I like.  
Still, I thought a little about why I had started watching only similar videos.

- Since the content is something I like, it's interesting and I end up watching it
- Even if I try to look for something new, the time it takes to find something interesting feels like a hassle
- When I get tired of YouTube, I switch to a different medium altogether, such as watching Netflix recommendations

When I lay it out like this, perhaps the simple issue is that “the cost of searching for something new is high.”

On the other hand, the suggestions provided by current platforms are quite excellent.

They automatically find reasonably high-quality content that I might be interested in and that many people are watching.

The experience itself is not bad.

In fact, I think it is convenient.

However, I feel that the amount of data I hand over to platforms as the price of that personalization is excessive.

Viewing history, time spent, search history, things I clicked on, and the things I am interested in.  
If you take it further, even my thought patterns and behavioral tendencies are being analyzed inside black-box algorithms.

I wouldn't go so far as to call it dystopian, but I have an unpleasant feeling that my behavior and thoughts are gradually being hacked.

So, I try not to be tracked as much as possible in my everyday life.

- Use a VPN
- Block the data sent by tracking scripts from X and other services
- Don't save my Google search history
- Don't save my YouTube watch history

When you do things like this, recommendations naturally become kind of stupid.

YouTube's recommendations outside of the channels I Subscribe to become fairly random, and I also start seeing more ads that have nothing to do with me.

AI is similar in some ways: if it has almost no information about you, it inevitably tends to give generic answers.

This is an entirely reasonable outcome. Without being given any data, the system has no way of knowing “what this person likes.”

As a result, it falls back to the safest option.

In other words, the current situation is that:

**There is a trade-off between protecting privacy and convenience on platforms**

But is this really a problem that cannot be solved on both fronts?

My viewing history, behavioral history, interests, and thoughts.

Couldn't I simply save this kind of data on my own devices without handing it over to the platform?

And if I used that data to make recommendations locally,

**couldn't I create a recommendation system just for myself while protecting my privacy?**

That is how this project began.

### The Objective Function of Platform Algorithms

As I mentioned earlier, the suggestions provided by platforms themselves are excellent.

So this is not simply a matter of “I want to build something better than YouTube's recommendations myself.”

However, when I think about the objective function of recommendation algorithms, I don't think it can be said that their sole objective is necessarily “maximizing the user experience.”

Platforms are for-profit companies, so metrics such as advertising revenue, time spent, and retention are also important.

And there is nothing inherently wrong with that.

If there are clearly measurable metrics such as advertising revenue and time spent, it is natural to repeat A/B tests and adopt whichever approach is most effective.

That seems like a natural thing to do when operating a service.

However, as a result,

- What to watch
- How much to watch
- What to watch next
- What to become interested in

are gradually entrusted to the platform.

Even if you think you are making your own choices, the choices themselves have already been arranged by the algorithm.

When you think about it that way, there is a faintly dystopian feeling to it.

That is why I wondered what would happen if I removed the role of filtering and recommending information from the platform and brought it into my own hands.

So I started this experiment.

### Building a Local YouTube Recommendation System

To get straight to the conclusion, I have finished building it to a certain extent and am currently using it.

The code is available on GitHub.

- **GitHub repository:** [https://github.com/mantaroh/youtube-recommendation](https://github.com/mantaroh/youtube-recommendation)

There are three major things this system prioritizes.

#### 1. Zero Tracking

Data about viewing history and preferences is not sent to external platforms for recommendation purposes; it is all stored in a database that I manage myself.

I also try to access external services in ways that make tracking as difficult as possible.

What is important is:

**Not allowing data about myself to accumulate on the platform side for recommendation purposes.**

#### 2. Algorithm Transparency and Self-Control

For every video, I make it possible to check “why this video was recommended.”

For example, I can change the weights used for recommendations myself, including:

- How much to prioritize recency
- Whether to increase the weight of a particular category
- How much to evaluate relevance to channels I like
- How much to prioritize similarity to my interest vector

If I want to watch something new today, I increase the weight of recency.

If I want to look for somewhat specialized videos, I increase the weight of that category.

I made it possible to tune the recommendation algorithm itself.

#### 3. Eliminating Noise

I also filter out things I don't want to watch in advance.

For example:

- Videos with excessively sensational thumbnails or titles
- Videos that seem to be aimed solely at farming views
- Entertainment content that I don't currently need
- Genres I have no interest in

It is not only about “what to recommend,” but also about:

**“What not to recommend,” which I decide for myself.**

I think this is also extremely important.

### “Running Recommendations Locally” as Reinventing the Wheel

At first, I intended to build it entirely from scratch.

However, when I looked into it, I found a system called [Anagnorisis](https://github.com/volotat/Anagnorisis) with a similar design philosophy, so I have also used its approach as a reference.

To be honest, at first I had little idea how far I would be able to take it.

But once I started building it, it unexpectedly came together.

Of course, tools such as Claude Code and Codex played a major role as well.

More than that, though, I think it is significant that infrastructure and surrounding technologies have become so well established over the past few years.

There are more services like Cloudflare, as well as services like Runpod that let you use a GPU only when you need one.

Lightweight yet powerful LLMs, vector databases, Embedding, transcription libraries, and so on have also become easy to use.

Five years ago, I probably would not have considered building the same thing as an individual.

In particular, the fact that it has become relatively easy for individuals to build a system that:

**transcribes a video → vectorizes it → compares it with my interest vector**

is a major development.

Compared with the “macro-level recommendations” that existing platforms produce from enormous amounts of user data, what I built this time could also be called:

**a micro-level recommendation system optimized solely for one person: myself**

Of course, all I have done so far is prove that it can be built.

Is it really convenient?

Will I encounter more new videos?

Will I be able to escape filter bubbles, or will I simply create a different filter bubble for myself?

I plan to use it in practice for a while and consider the results as well.

### Finally

This is not about criticizing the way a particular tech company or platform operates.

Now that tracking and suggestion systems are becoming increasingly sophisticated, how much of my decision-making should I entrust to external algorithms?

And what kind of experience will result in a world where that decision-making is separated from existing systems and brought back into my own hands?

This is an experiment to find out for myself.
