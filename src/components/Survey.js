import React from "react";
import * as Survey from "survey-react";
import "survey-react/survey.css";
import ColoredBackgroundGrid from "./ColoredBackgroundGrid";
import background from "../images/background.jpeg";
import { Dimmer, Grid, GridColumn, Loader, Segment } from "semantic-ui-react";

Survey.StylesManager.applyTheme("darkblue");

const json = {
  title: "Digitale Voetsporen survey",
  description: "Please fill in this short survey about your news habits",
  logo: "https://www.uni-bremen.de/fileadmin/user_upload/fachbereiche/fb8/vu-vrije-universiteit-amsterdam.jpg",
  logoWidth: 150,
  pages: [
    {
      questions: [
        {
          name: "mobile_yn",
          type: "radiogroup",
          title: "Do you own a smartphone?",
          isRequired: true,
          colCount: 1,
          choices: ["Yes", "No"],
        },
        {
          type: "imagepicker",
          name: "os_mobile",
          title: "What operating system do you have on your smartphone?",
          visibleIf: "{mobile_yn}= 'Yes'",
          imageHeight: 70,
          imageWidth: 70,
          hasOther: true,
          showLabel: true,
          choices: [
            {
              value: "iOS",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            },
            {
              value: "Android",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg",
            },
          ],
        },
        {
          type: "imagepicker",
          name: "browser_mobile",
          title: "What browser do you primarily use on your phone?",
          visibleIf: "{mobile_yn}='Yes'",
          imageHeight: 70,
          imageWidth: 70,
          showLabel: true,
          choices: [
            {
              value: "Chrome",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg",
            },
            {
              value: "Safari",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/5/52/Safari_browser_logo.svg",
            },
            {
              value: "Firefox",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/6/67/Firefox_Logo%2C_2017.svg",
            },
            {
              value: "Samsung",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/e/e9/Samsung_Internet_logo.svg",
            },
            {
              value: "Huawei",
              imageLink:
                "https://consumer-img.huawei.com/content/dam/huawei-cbg-site/common/mkt/pdp/mobile-services/browser/img/Huawei-Browser-logo.png",
            },
            {
              value: "Edge",
              imageLink:
                "https://assets.t3n.sc/news/wp-content/uploads/2019/11/edge-logo-teaser.png?auto=format%2Ccompress&fit=crop&h=350&ixlib=php-3.3.1&q=75&w=620",
            },
          ],
        },
        {
          name: "laptop_yn",
          type: "radiogroup",
          title: "Do you own a laptop/PC you use more than once a month?",
          isRequired: true,
          colCount: 1,
          choices: ["Yes", "No"],
        },
        {
          type: "imagepicker",
          imageHeight: 70,
          imageWidth: 70,
          showLabel: true,
          name: "os_laptop",
          title: "What operating system do you have on your most-used private laptop/PC?",
          visibleIf: "{laptop_yn}= 'Yes'",
          choices: [
            {
              value: "MacOS",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            },
            {
              value: "Windows",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/8/87/Windows_logo_-_2021.svg",
            },
            {
              value: "Linux",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Linux_Platform.svg",
            },
          ],
        },
      ],
    },

    {
      questions: [
        {
          type: "imagepicker",
          imageHeight: 50,
          imageWidth: 50,
          showLabel: true,
          colCount: 5,
          hasNone: true,
          name: "social_media",
          multiSelect: true,
          title: "Which of these services did you use in the last 3 months?",
          choices: [
            {
              value: "Twitter",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/6/63/Twitter-logo-png-5859_-_Copy.png",
            },
            {
              value: "Facebook",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/a/a7/Facebook_f_Logo_%28with_gradient%29.svg",
            },
            {
              value: "Instagram",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
            },
            {
              value: "WhatsApp",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
            },
            {
              value: "Snapchat",
              imageLink: "https://www.logo.wine/a/logo/Snapchat/Snapchat-Logo.wine.svg",
            },
            {
              value: "TikTok",
              imageLink: "https://cdn.worldvectorlogo.com/logos/tiktok-logo.svg",
            },
            {
              value: "YouTube",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/8/86/Youtube_%281%29.svg",
            },
            {
              value: "Nu.nl",
              imageLink: "https://iconape.com/wp-content/png_logo_vector/nu-nl-logo.png",
            },
            {
              value: "NOS",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/b/b9/NOS_logo.svg",
            },
            {
              value: "Blendle",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/b/be/Blendle_logo.svg",
            },
            {
              value: "AD",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/2/2a/New_Logo_AD.jpg",
            },
            {
              value: "Volkskrant",
              imageLink:
                "https://images0.persgroep.net/rcs/8qYGt4qDcaaKsrPlL8P9DyMjoLI/diocontent/161512203/_focus/0.5/0.5/_fill/280/280?appId=93a17a8fd81db0de025c8abd1cca1279&quality=0.85",
            },
            {
              value: "Telegraaf",
              imageLink:
                "https://play-lh.googleusercontent.com/CvKhWZBtasdfn-50t1qgmSKjBQcApWeHcE_q_mKpfS1G346A6lUDHUnUDfH_uzsJJkw6",
            },
            {
              value: "Feedly",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Feedly_Logo.svg/1200px-Feedly_Logo.svg.png",
            },
            {
              value: "RTL",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/RTL_Nederland.svg/1024px-RTL_Nederland.svg.png",
            },
            {
              value: "Apple News",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Apple_News_icon_%28iOS%29.png/600px-Apple_News_icon_%28iOS%29.png",
            },
            {
              value: "Teletekst",
              imageLink: "https://pbs.twimg.com/profile_images/432824663316496384/-rXY3JwX.png",
            },
            {
              value: "NRC",
              imageLink: "https://assets.nrc.nl/static/front/img/onze-app/nrc.png",
            },
            {
              value: "Guardian",
              imageLink: "https://assets.guim.co.uk/images/apps/app-logo.png",
            },
            {
              value: "FD",
              imageLink:
                "https://www.aurumeurope.com/wp-content/uploads/2020/03/fd-logo-energie-app-huisbaasje.png",
            },
            {
              value: "Podcasts",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Podcasts_%28iOS%29.svg/1024px-Podcasts_%28iOS%29.svg.png",
            },
            {
              value: "Google News",
              imageLink: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Google_News_icon.png",
            },
            {
              value: "Spotify",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2048px-Spotify_logo_without_text.svg.png",
            },
            {
              value: "Clubhouse",
              imageLink:
                "https://res.cloudinary.com/brandpad/raw/upload/v1539039929/asset-203x.png",
            },
            {
              value: "BBC",
              imageLink:
                "http://lh3.googleusercontent.com/Iip-8Yn3PLAzecCMb4ZaHTvFObl3ETUWZmd5zLflhbB6BXKyNc5aM4hrGAA9NXSs7i0",
            },
            {
              value: "Trouw",
              imageLink: "https://sel-static.persgroep.net/shared/images/trouw-placeholder.png",
            },
            {
              value: "Signal",
              imageLink:
                "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Signal-Logo.svg/1200px-Signal-Logo.svg.png",
            },
          ],
        },
        {
          name: "other_apps",
          type: "text",
          isRequired: false,
          title: "Do you use any other services for news? Tell us more about it!",
        },
        {
          name: "birthdate",
          type: "text",
          inputType: "date",
          title: "Your birthdate:",
          isRequired: true,
          autoComplete: "bdate",
        },
        {
          name: "email",
          type: "text",
          inputType: "email",
          title: "If you want to receive a portfolio of your results, insert your email here",
          placeHolder: "jon.snow@nightwatch.org",
          isRequired: true,
          autoComplete: "email",
          validators: [{ type: "email" }],
        },
      ],
    },
  ],
};

const survey = new Survey.Model(json);

const FinalForm = () => {
  return (
    <Grid
      style={{
        height: "calc(100vh + 500px)",
      }}
    >
      <Grid.Column width={2}></Grid.Column>
      <GridColumn width={12}>
        <Survey.Survey model={survey} />
      </GridColumn>
      <Grid.Column width={2}></Grid.Column>
    </Grid>
  );
};

export default FinalForm;
