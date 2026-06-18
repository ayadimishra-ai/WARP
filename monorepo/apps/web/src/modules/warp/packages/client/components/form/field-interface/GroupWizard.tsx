import {
  Button,
  Group,
  Image,
  Tabs,
  Tooltip,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { ReactNode, Children, isValidElement, useState } from "react";

const useStyles = createStyles((theme) => ({
  fullWidth: {
    alignSelf: "stretch",
  },
  group: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tabsList: {
    gap: "0",
  },
  template2Background: {
    background: theme.colors.teal[1],
    "&:hover": {
      background: theme.colors.teal[1],
    },
  },
}));
type Props = {
  children: ReactNode;
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    tabs: any;
    template: string;
    showControls: boolean;
  };
  display: string;
  displayOptions: {};
};
const GroupWizard = ({
  children,
  fieldOptions,
  interfaceOptions,
  display,
}: Props) => {
  const { classes } = useStyles();
  const [activeTab, setActiveTab] = useState<string | null>("1");
  return (
    <>
      <Tabs
        variant={
          interfaceOptions?.template === "template2" ? "pills" : "default"
        }
        color="indigo"
        radius="xs"
        value={activeTab}
        onChange={setActiveTab}
        defaultValue={"1"}
        classNames={
          interfaceOptions?.template === "template2"
            ? {
                tab: classes.template2Background,
                list: classes.tabsList,
              }
            : {
                tab: "",
                list: "",
              }
        }
      >
        <Tabs.List>
          {interfaceOptions?.tabs.map((data: any) => (
            <Tabs.Tab
              key={data.tabKey.toString()}
              disabled={fieldOptions?.readonly}
              rightSection={
                data.icon.icon !== null ? (
                  <Tooltip label={data.icon.tooltip}>
                    <Image
                      width={20}
                      alt={data.icon.icon}
                      src={data.icon.icon}
                    />
                  </Tooltip>
                ) : null
              }
              value={data.tabKey.toString()}
            >
              {data.tabName}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {Children.map(children, (data: any, index: number) => (
          <Tabs.Panel
            key={index + "test"}
            value={(index + 1).toString()}
            pt="xs"
          >
            {data.props.children}
            {interfaceOptions.showControls && (
              <Group mt={20}>
                <Button
                  color="dark.3"
                  onClick={() => setActiveTab(index.toString())}
                  variant="outline"
                >
                  Prev
                </Button>
                <Button
                  color="orange.5"
                  onClick={() => setActiveTab((index + 2).toString())}
                >
                  Next
                </Button>
              </Group>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </>
  );
};
export default GroupWizard;
