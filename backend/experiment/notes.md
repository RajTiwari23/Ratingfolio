First we need to look for what are the data points we need to generate in order for it work

From each site, what are the data we need to collect?

1. Rating.
2. Number of questions.
3. Number of wrong submission, and number of correct submission.
4. Number of contests, along with submissions that are equal to that contests.

At the end, each user will have a dedicated rating

1. Accuracy
2. Rating
3. On Contest Accuracy
4. Number of Questions
5. On Contest Rating

Scraper
-> Javascript based scraper
->

codechef data for all the submissions including all the types of submission
https://www.codechef.com/recent/user?page=1&user_handle=yolokun


https://www.codechef.com/api/list/contests/past?sort_by=START&sorting_order=desc&offset=160&mode=all



Right now
here are the list of things you need to work on
First, contests listing from the website
codechef.com -> https://www.codechef.com/api/list/contests/past?sort_by=START&sorting_order=desc&offset=160
codeforces.com -> https://codeforces.com/api/contest.list
Second, Creating submissions inside of transaction.
first we need to check whether a submission already exists then we don't need to create a new one. Using submission Link, we can actually do that.
once the extraction process is complete, based on the failure and completion, 

planning is this way
Failure -> 30 mins
Completed -> 1 day

then after collecting all the submissions we perform the below operation.


When we are trying to calculate the accuracy, we can use the aggregate functions in the database for calculating the number of correct submission, and total number of submissions.

Creating endpoints for retrieving the list of contests as well as submissions
/submissions -> get the list of submissions with pagination