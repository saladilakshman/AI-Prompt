import { useEffect, useState, Suspense } from 'react'
import './App.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Box, TextField, Avatar, Stack, Fab, Container, Typography, Divider, IconButton, Tooltip, InputAdornment, Skeleton } from "@mui/material";
import Markdown from 'react-markdown';
//import remarkGfm from 'remark-gfm';
import Bot from "./assets/bot.png";
import html2pdf from 'html2pdf.js';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import { AI_KEY } from './key';
function App() {
  const genAI = new GoogleGenerativeAI(AI_KEY);
  const [iconactions, setIconactions] = useState({
    copy: 'Copy',
    speaker: 'Read Aloud',
    isPlay: false,
    speakerIcon: <VolumeUpIcon sx={{ fontSize: 20 }} />
  })


  const ContentActions = [
    {
      actionname: iconactions.copy,
      icon: <ContentPasteIcon sx={{ fontSize: 20 }} />,
      action: async function () {
        const contentinfo = document.querySelector(".gpt-content");
        await navigator.clipboard.writeText(contentinfo.textContent)
          .then(() => setIconactions({ ...iconactions, copy: 'Copied' }))
          .catch(err => console.log(err.message))
        setTimeout(() => {
          setIconactions({ ...iconactions, copy: 'Copy' })
        }, 2000)
      },
    },
    {
      actionname: iconactions.speaker,
      icon: iconactions.speakerIcon,
      action: function () {
        const contentinfo = document.querySelector(".gpt-content")
        const speaker = window.speechSynthesis;
        const wordtospeak = new SpeechSynthesisUtterance(contentinfo.textContent);
        wordtospeak.voice = speaker.getVoices()[88];
        if (!iconactions.isPlay) {
          speaker.speak(wordtospeak)
          setIconactions({ ...iconactions, isPlay: true, speaker: 'stop', speakerIcon: <RadioButtonCheckedIcon sx={{ fontSize: 20 }} /> })
        }
        if (iconactions.isPlay) {
          speaker.pause(wordtospeak)
          setIconactions({ ...iconactions, isPlay: false, speaker: 'resume', speakerIcon: <VolumeUpIcon sx={{ fontSize: 20 }} /> })
        }
        if (!iconactions.isPlay) {
          speaker.resume(wordtospeak)
          setIconactions({ ...iconactions, isPlay: true, speaker: 'stop', speakerIcon: <RadioButtonCheckedIcon sx={{ fontSize: 20 }} /> })
        }
      }
    },
    {
      actionname: 'Download',
      icon: <FileUploadIcon sx={{ fontSize: 20 }} />,
      action: function () {
        const element = document.getElementById('info');
        const to_element = document.getElementById("prompt");
        var opt = {
          margin: 1,
          filename: 'AI.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
          },
          page: 2
        };
        html2pdf().set(opt).from(element).save()
      }
    }
  ]


  const [prompts, setPrompts] = useState([{
    userInput: '',
    AIoutput: ``,
  }]);


  const [appactions, setAppactions] = useState({
    disablebtn: true,
    inputText: '',
    showwelcome: true,
    isfetching: true,
    iserror: false,
    isdatafetched: false,
    showiconaction: false
  })
  return (
    <>
      <Container sx={{
        width: { xs: '100%', lg: '50%' },
        marginBlockStart: 5,
        marginBlockEnd: 3,
        position: 'relative'
      }} id="info">
        {Array.from(prompts, (prompt, index) => {
          if (prompt.userInput === "" || prompt.AIoutput === "") {
            return appactions.showwelcome && <Box component="div" sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingBlockStart: '10%'
            }}>
              <Box component="img" alt="" src="https://pbs.twimg.com/profile_images/1634058036934500352/b4F1eVpJ_400x400.jpg"
                sx={{
                  width: { xs: 80, lg: 100 },
                  pb: 2
                }}

              />
              <Typography variant="h3" color="inherit" sx={{
                fontWeight: 500,
                fontSize: { xs: 30, lg: 46 }
              }}
                id="logo"
              >
                Hello Dev,<br />How can I help you?
              </Typography>
            </Box>
          }
          else {
            return <Box key={index}>
              <Suspense fallback={<p>loading...</p>}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline', gap: 2, paddingBlockEnd: 3 }}>
                  <Stack direction="row" justifyContent={"center"} alignItems="center" spacing={1.2}>
                    <Avatar size="small" />
                    <Typography variant="h6" color="inherit">Guest user</Typography>
                  </Stack>
                  <Box>
                    <Typography variant="body1" color="inherit">
                      {prompt.userInput}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline', gap: 2, paddingBlockStart: 2 }} >
                  <Stack direction="row" justifyContent={"center"} alignItems="center" spacing={1.2}>
                    <Avatar src={Bot} size="small" />
                    <Typography variant="h6" color="inherit">UNU</Typography>
                  </Stack>
                  <Box>
                    <Typography variant="body1" color="inherit" className="gpt-content">
                      {appactions.isfetching && <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Skeleton variant="rectangle" sx={{ width: { xs: 220, lg: '45rem' } }} />
                        <Skeleton variant="rectangle" sx={{ width: { xs: 260, lg: '40rem' } }} />
                        <Skeleton variant="rectangle" sx={{ width: { xs: 290, lg: '35rem' } }} />
                      </Box>}
                      {appactions.iserror && <p>Opps! something went wrong</p>}
                      {appactions.isdatafetched && <Markdown>{prompt.AIoutput}</Markdown>}
                    </Typography>
                  </Box>
                </Box>
              </Suspense>
            </Box>
          }
        })}

        {appactions.showiconaction && <Box>
          <Stack direction="row" justifyContent="start" alignItems="center" spacing={0.3} sx={{ marginBlockEnd: 8 }} id="prompt">
            {Array.from(ContentActions, (contentaction, index) => {
              return <Tooltip title={contentaction.actionname} arrow placement="top-end" key={index}>
                <Box component={IconButton} onClick={contentaction.action}>
                  {contentaction.icon}
                </Box>
              </Tooltip>
            })}
          </Stack>
        </Box>}

        {/**JSX code for input that accepts the user text */}
        <TextField
          type="search"
          fullWidth
          size="medium"
          multiline
          maxRows={20}
          sx={{
            marginBlockStart: 4,
            position: 'fixed',
            backgroundColor: 'white',
            width: { xs: '100%', lg: '50%' },
            bottom: 1.5,
            right: { xs: 0, lg: 'auto' },
            left: { xs: 0, lg: 'auto' }
          }}
          placeholder="Enter your prompt here"
          value={appactions.inputText}
          onChange={(e) => {
            if (e.target.value.length > 0) {
              setAppactions({ ...appactions, disablebtn: false, inputText: e.target.value })
            }
            else {
              setAppactions({ ...appactions, disablebtn: true, inputText: "" })
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <IconButton size="small" disabled={appactions.disablebtn} onClick={async () => {
                  setAppactions({ ...appactions, inputText: '', showwelcome: false, isfetching: true, isdatafetched: false, iserror: false });
                  setPrompts((prevState) => [...prevState, { userInput: appactions.inputText }]);
                  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                  const prompt = appactions.inputText;
                  const result = await model.generateContent(prompt);
                  const response = result.response;
                  const text = response.text();
                  console.log(response)
                  if (text) {
                    setAppactions({ ...appactions, isfetching: false, isdatafetched: true, iserror: false, showiconaction: true, showwelcome: false, inputText: '' });
                    setPrompts([...prompts, { userInput: appactions.inputText, AIoutput: text }]);
                  } if (response.text === "Text not available") {
                    setAppactions({ ...appactions, isfetching: false, isdatafetched: false, iserror: true, showiconaction: false, showwelcome: false, inputText: '' });
                    setPrompts((prevState) => [...prevState, { userInput: '', AIoutput: `` }]);
                  }
                  // setTimeout(() => {
                  //   setAppactions({ ...appactions, isfetching: false, isdatafetched: true, iserror: false, showiconaction: true, showwelcome: false, inputText: '' });
                  //   setPrompts([...prompts, { userInput: appactions.inputText, AIoutput: markdowncontent }]);
                  // }, 4000)
                }}>
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Container >
    </>
  )
}

export default App
