import test from "ava";
import {
  conform_to_schema,
  SNIPPET_SCHEMA,
  SNIPPET_SECTION_SCHEMA,
} from "~/model";
import TTS from "~/model/types";
import { UNCATEGORIZED_GROUP_NAME } from "~/common";
import {
  import_data,
  validate_import_data,
} from "~/view/components/export/utils";

const snippets_list = require("./data/snippets.json");
const snippets_sections_list = require("./data/snippets-sections.json");
const settings = require("./data/settings.json");

import {
  SNIPPET_SECTION_ONE,
  SNIPPET_SECTION_TWO,
  SNIPPET_SECTION_THREE,
  SNIPPET_S1_ONE,
  SNIPPET_S1_TWO,
  SNIPPET_S1_THREE,
  SNIPPET_S2_ONE,
  SNIPPET_S2_TWO,
  SNIPPET_S2_THREE,
  SNIPPET_S3_ONE,
  SNIPPET_S3_TWO,
  SNIPPET_S3_THREE,
  SNIPPET_ONE,
  SNIPPET_TWO,
  SNIPPET_THREE,
  // @ts-expect-error:
} from "./data/snippets.ts";

const snippet_one = conform_to_schema(SNIPPET_ONE, SNIPPET_SCHEMA);
const snippet_two = conform_to_schema(SNIPPET_TWO, SNIPPET_SCHEMA);
const snippet_three = conform_to_schema(SNIPPET_THREE, SNIPPET_SCHEMA);
const snippet_s1_one = conform_to_schema(SNIPPET_S1_ONE, SNIPPET_SCHEMA);
const snippet_s1_two = conform_to_schema(SNIPPET_S1_TWO, SNIPPET_SCHEMA);
const snippet_s1_three = conform_to_schema(SNIPPET_S1_THREE, SNIPPET_SCHEMA);
const snippet_s2_one = conform_to_schema(SNIPPET_S2_ONE, SNIPPET_SCHEMA);
const snippet_s2_two = conform_to_schema(SNIPPET_S2_TWO, SNIPPET_SCHEMA);
const snippet_s2_three = conform_to_schema(SNIPPET_S2_THREE, SNIPPET_SCHEMA);
const snippet_s3_one = conform_to_schema(SNIPPET_S3_ONE, SNIPPET_SCHEMA);
const snippet_s3_two = conform_to_schema(SNIPPET_S3_TWO, SNIPPET_SCHEMA);
const snippet_s3_three = conform_to_schema(SNIPPET_S3_THREE, SNIPPET_SCHEMA);
const snippet_section_one = conform_to_schema(
  SNIPPET_SECTION_ONE,
  SNIPPET_SECTION_SCHEMA
);
const snippet_section_two = conform_to_schema(
  SNIPPET_SECTION_TWO,
  SNIPPET_SECTION_SCHEMA
);
const snippet_section_three = conform_to_schema(
  SNIPPET_SECTION_THREE,
  SNIPPET_SECTION_SCHEMA
);

const uncat_category = {
  name: UNCATEGORIZED_GROUP_NAME,
  open: false,
  data: [],
};

test("validate one snippet section", t => {
  const initial = SNIPPET_SECTION_ONE;
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection;
  t.deepEqual(initial, validated);
});

test("validate one snippet section in array", t => {
  const initial = [SNIPPET_SECTION_ONE];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection[];
  t.deepEqual(initial, validated);
});

test("validate many snippet sections", t => {
  const initial = [
    SNIPPET_SECTION_ONE,
    SNIPPET_SECTION_TWO,
    SNIPPET_SECTION_THREE,
  ];
  const validated = validate_import_data(
    initial
  ) as TTS.ExportedSnippetsSection[];
  t.deepEqual(initial, validated);
});

test("import one snippet section", t => {
  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    SS_ONE,
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );
  t.deepEqual(snippets_result, [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
  ]);

  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_list,
    snippet_section_one,
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import one snippet section in array", t => {
  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [SS_ONE],
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );
  t.deepEqual(snippets_result, [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
  ]);

  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_list,
    snippet_section_one,
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import many snippet sections", t => {
  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };
  const SS_TWO = {
    ...SNIPPET_SECTION_TWO,
    data: [SNIPPET_S2_ONE, SNIPPET_S2_TWO, SNIPPET_S2_THREE],
  };
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [
      SS_ONE,
      SS_TWO,
      SNIPPET_SECTION_THREE,
      SNIPPET_S3_ONE,
      SNIPPET_S3_TWO,
      SNIPPET_S3_THREE,
    ],
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );
  t.deepEqual(snippets_result, [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
    snippet_s2_one,
    snippet_s2_two,
    snippet_s2_three,
    snippet_s3_one,
    snippet_s3_two,
    snippet_s3_three,
  ]);

  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_list,
    snippet_section_one,
    snippet_section_two,
    snippet_section_three,
  ]);

  t.is(settings_result, undefined);
  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("reject empty snippet section", t => {
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    {
      ...SNIPPET_SECTION_ONE,
      data: [],
    },
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import existing section with existing snippet", t => {
  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };

  const snippets_before = [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
  ];
  const snippets_sections_before = [
    ...snippets_sections_list,
    snippet_section_one,
  ];

  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [
      SS_ONE,
      SNIPPET_SECTION_TWO,
      SNIPPET_S2_ONE,
      SNIPPET_S2_TWO,
      SNIPPET_S2_THREE,
    ],
    settings,
    [],
    snippets_before,
    [],
    uncat_category,
    snippets_sections_before
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.deepEqual(snippets_result, [
    ...snippets_before,
    snippet_s2_one,
    snippet_s2_two,
    snippet_s2_three,
  ]);
  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_before,
    snippet_section_two,
  ]);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import sections with duplicate snippets", t => {
  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };
  const SS_TWO = {
    ...SNIPPET_SECTION_ONE,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };
  const SS_THREE = {
    ...SNIPPET_SECTION_THREE,
    data: [SNIPPET_S1_ONE.id, SNIPPET_S3_TWO.id, SNIPPET_S3_THREE.id],
  };

  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [
      SS_ONE,
      SS_TWO,
      SS_THREE,
      SNIPPET_S1_ONE,
      SNIPPET_S3_TWO,
      SNIPPET_S3_THREE,
    ],
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.deepEqual(snippets_result, [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
    snippet_s3_two,
    snippet_s3_three,
  ]);
  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_list,
    snippet_section_one,
    {
      ...snippet_section_three,
      data: [snippet_s3_two.id, snippet_s3_three.id],
    },
  ]);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});
test("import new section with existing snippets", t => {
  const SS_TWO = {
    ...SNIPPET_SECTION_TWO,
    data: [SNIPPET_S1_ONE, SNIPPET_S1_TWO, SNIPPET_S1_THREE],
  };

  const snippets_before = [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s1_three,
  ];
  const snippets_sections_before = [
    ...snippets_sections_list,
    snippet_section_one,
  ];

  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [SS_TWO],
    settings,
    [],
    snippets_before,
    [],
    uncat_category,
    snippets_sections_before
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});

test("import mix of new/existing sections with mix of new/categorized/uncategorized/dupe snippets", t => {
  const snippets_before = [
    ...snippets_list,
    snippet_s1_one,
    snippet_s1_two,
    snippet_s2_three,
    snippet_one,
    snippet_two,
    snippet_s3_one,
    snippet_s3_two,
  ];
  const snippets_sections_before = [
    ...snippets_sections_list,
    {
      ...snippet_section_one,
      data: [
        snippet_s1_one.id,
        snippet_s1_two.id,
        snippet_s2_three.id,
        snippet_one.id,
      ],
    },
    {
      ...snippet_section_three,
      data: [snippet_s3_one.id, snippet_s3_two.id, snippet_two.id],
    },
  ];

  const DUPE_S1_ONE = {
    ...SNIPPET_S1_ONE,
    id: "dupe-s1-one",
  };
  const DUPE_S1_TWO = {
    id: "dupe-s1-two",
    ...SNIPPET_S1_TWO,
    options: {
      ...SNIPPET_S1_TWO.options,
      space_before: !SNIPPET_S1_TWO.options.space_before,
    },
  };
  const DUPE_S2_THREE = {
    ...SNIPPET_S2_THREE,
    options: {
      ...SNIPPET_S2_THREE.options,
      space_before: !SNIPPET_S2_THREE.options.space_before,
    },
  };
  const DUPE_S3_ONE = {
    ...SNIPPET_S3_ONE,
    id: "dupe-s3-one",
  };
  const DUPE_S3_TWO = {
    ...SNIPPET_S3_TWO,
    options: {
      ...SNIPPET_S3_TWO.options,
      space_before: !SNIPPET_S3_TWO.options.space_before,
    },
  };
  const DUPE_ONE = {
    ...SNIPPET_ONE,
    options: {
      ...SNIPPET_ONE.options,
      space_before: !SNIPPET_ONE.options.space_before,
    },
  };
  const DUPE_TWO = {
    id: "dupe-two",
    ...SNIPPET_TWO,
    options: {
      ...SNIPPET_TWO.options,
      space_before: !SNIPPET_TWO.options.space_before,
    },
  };

  const SS_ONE = {
    ...SNIPPET_SECTION_ONE,
    data: [DUPE_S1_ONE, DUPE_S1_TWO, snippet_s1_three, DUPE_S2_THREE, DUPE_ONE],
  };

  const SS_THREE = {
    ...SNIPPET_SECTION_THREE,
    data: [DUPE_S3_ONE.id, DUPE_S3_TWO.id, snippet_s3_three.id, DUPE_TWO.id],
  };

  const input = [
    SS_ONE,
    SNIPPET_SECTION_TWO,
    SS_THREE,
    SNIPPET_S1_THREE,
    SNIPPET_S2_ONE,
    SNIPPET_S2_TWO,
    SNIPPET_S2_THREE,
    DUPE_S3_ONE,
    DUPE_S3_TWO,
    DUPE_TWO,
    SNIPPET_THREE,
  ];

  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    input,
    settings,
    [],
    snippets_before,
    [],
    uncat_category,
    snippets_sections_before
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.deepEqual(snippets_result, [
    ...snippets_before,
    snippet_s1_three,
    snippet_s2_one,
    snippet_s2_two,
  ]);
  t.deepEqual(snippets_sections_result, [
    ...snippets_sections_list,
    {
      ...snippet_section_one,
      data: [
        snippet_s1_one.id,
        snippet_s1_two.id,
        snippet_s2_three.id,
        snippet_one.id,
        DUPE_S1_ONE.id,
        snippet_s1_three.id,
      ],
    },
    {
      ...snippet_section_three,
      data: [
        snippet_s3_one.id,
        snippet_s3_two.id,
        snippet_two.id,
        DUPE_S3_ONE.id,
        snippet_s3_three.id,
      ],
    },
    { ...snippet_section_two, data: snippet_section_two.data.slice(0, 2) },
  ]);
  t.deepEqual(
    dup_snippets,
    [DUPE_S1_TWO, DUPE_S2_THREE, DUPE_ONE, DUPE_S3_TWO, DUPE_TWO].map(
      ({ __type, ...snip }) => snip
    )
  );
  t.deepEqual(uncategorized_snippets, [snippet_three]);

  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
});

test("reject category with ids but no message records", t => {
  const [
    settings_result,
    messages_result,
    snippets_result,
    categories_result,
    snippets_sections_result,
    uncat_result,
    dup_messages,
    rename_messages,
    dup_snippets,
    uncategorized_snippets,
  ] = import_data(
    [SNIPPET_SECTION_ONE],
    settings,
    [],
    snippets_list,
    [],
    uncat_category,
    snippets_sections_list
  );

  t.is(messages_result, undefined);
  t.is(categories_result, undefined);
  t.is(settings_result, undefined);
  t.is(snippets_result, undefined);
  t.is(snippets_sections_result, undefined);
  t.deepEqual(uncat_result, uncat_category);
  t.deepEqual(dup_messages, []);
  t.deepEqual(rename_messages, []);
  t.deepEqual(dup_snippets, []);
  t.deepEqual(uncategorized_snippets, []);
});
