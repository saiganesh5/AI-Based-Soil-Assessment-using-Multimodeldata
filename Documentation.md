# This is my Development documentation where I write my ideas, the errors I faced during development and in production and how I solved them.

## Issues during Development


## Issues during Production
#### 1.The Issue of Language mismatch 
When I deployed my Application in AWS Elastic bean stalk, the health logs broke and the whole application was red. Because I compiled my Jar file with Java22 Language level where the 
environment I selected in AWS Beanstalk is 21 Language level. This broke my application from running and stopped taking requests. I downloaded the logs session and gone through them and
understood that it was the language version breaking my application.
