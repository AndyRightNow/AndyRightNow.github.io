---
draft: true
external: false
title: "Why Tic-Tac-Toe is an Annoyingly Brilliant Front-End Interview Coding Test"
description: "Why Tic-Tac-Toe is an Annoyingly Brilliant Front-End Interview Coding Test"
date: 2024-12-06
---

I assume we all know what a [Tic-tac-toe game](https://www.google.com/search?q=tic+tac+toe) is, right? If you click the link, you can even play it in the search result and it's beautifully made.

Well, how about implementing it in your favorite front-end frameworks   in **less than 30 minutes** with **variable board size and number to win support**?


![Winning sequences in 5 x 5 tic-tac-toe](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d25g2cbvcam87oojr8az.png)


I tried it and timed it and it's not easy. 

What's more, it actually covers more aspects of how well a person can handle requirements, communication, designing and programming than I originally thought. 

Thanks to (or not?) this coding test, I unfortunately have to turn down several candidates who can't even figure out a simple implementation within the time frame.

## What's so good about it?

> When we interview someone, we are evaluating whether we want to work with this person or not.

Let's add more to this principle:

> And whether we want to touch this person's code or not.

Tic-tac-toe shows them all. Well, probably not exactly all but, most of them. Why? 

Let's take it step by step from a candidate's perspective.

### First, clarify the requirements

When you hear the simple question:

> Could you implement a Tic-tac-toe game in any framework of your choice?

If you are experienced enough ~~(completely fed-up)~~ with working overtime to meet the deadline due to unclear requirements and subsequent changes, you'd know it's the right time to ask many more questions.

For example:

- ~~What the hell is a Tic-tac-toe game?~~
- Does it need to have pretty style?
- Is it going to be only 3x3? Can users change the size?
- Is the winning rule the same as the classic Tic-tac-toe?
- Can I look up documentations and syntaxes during the process?
- Can I ask AI? (Please, don't do it)

If it's timed, asking questions would only narrow the range and probably save you a lot of time. Also, some interviewers are just blatantly setting it up with an intentionally unclear question, waiting for you to ask more. (I do)

### Second, boot up a starter app and development environment

Using [CodeSandbox](https://codesandbox.io/) or [Stackblitz](https://stackblitz.com/) is completely fine, or even recommended because it cuts unnecessary hassles. If you want to flex your scaffolding skills (I donno if there is one), you can also do it locally.

In this step, the interviewers would love to see your familiarity with the build tools and the development environment, given that the tool chain for front-end development has evolved to be much more complicated (or simplified) than before.

So yeah, being able to seamlessly bootstrap a local development environment without looking up documentations and StackOverflow would be extremely impressive. However, it's not required so don't try them easily during interviews unless you are 100% sure what you are doing.  It might just come back and bite you.

### Third, start describing

