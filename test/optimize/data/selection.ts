export const SELECTION_TESTS = [
  {
    input: "  you | ar|e   not right    ",
    output: "  you |ar|e   not right    ",
  },
  {
    input: "  you,| ar|e   not right    ",
    output: "  you,|ar|e   not right    ",
  },
  {
    input: "  you | are |  not right    ",
    output: "  you |ⓡ|  not right    ",
  },
  {
    input: "  you  |are   not right |   ",
    output: "  you  |ⓡnot rite|   ",
  },
  {
    input: "  you\n | ar|e  \n not right    ",
    output: "  you\n |ar|e  \n not right    ",
  },
  {
    input: "  you,|\n ar|e  \n not right    ",
    output: "  you,|\nar|e  \n not right    ",
  },
  {
    input: "  you, |\n ar|e  \n not right    ",
    output: "  you, |\nar|e  \n not right    ",
  },
  {
    input: "  you,\n |\n ar|e  \n not right    ",
    output: "  you,\n |\nar|e  \n not right    ",
  },
  {
    input: "  you, \n|\n ar|e  \n not right    ",
    output: "  you, \n|ar|e  \n not right    ",
  },
  {
    input: "  you |\n are\n |  not right    ",
    output: "  you |\nⓡ\n|  not right    ",
  },
  {
    input: "  you  \n|are   not right \n|   ",
    output: "  you  \n|ⓡnot rite\n|   ",
  },
  {
    input: "Do not send| this message to the |streamer.",
    output: "Do not send| þis message2 þe |streamer.",
  },
];

export const TRIM_SELECTION_TESTS = [
  {
    input: "  you | ar|e   not right    ",
    output: "you |ar|e not right",
  },
  {
    input: "  you,| ar|e   not right    ",
    output: "you,| ar|e not right",
  },
  {
    input: "  you | are |  not right    ",
    output: "you |are |not right",
  },
  {
    input: "  you  |are   not right |   ",
    output: "you |are not right|",
  },
  {
    input: "  you\n|ar|e\nnot right    ",
    output: "you\n|ar|e\nnot right",
  },
  {
    input: "  you,|\n ar|e\nnot right    ",
    output: "you,|\nar|e\nnot right",
  },
  {
    input: "  you |\n are\n |  not right    ",
    output: "you|\nare\n|not right",
  },
  {
    input: "  you  \n|are   not right \n|   ",
    output: "you\n|are not right|",
  },
  {
    input: "Do not send| \nthis message to the |\nstreamer.",
    output: "Do not send|\nthis message to the|\nstreamer.",
  },
];
