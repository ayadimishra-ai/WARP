import { Box, Button, Popover, Title } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useDisclosure } from "@mantine/hooks";
import BulbIcon from "@/modules/warp/packages/client/icons/BulbIcon";
import { InfoIconPropsType } from "../types";

const useStyles = createStyles((theme) => ({
  modalHeader: {
    background: "#EEFCFA",
    margin: "-20px -20px 0",
    padding: "10px 20px",
    fontWeight: "bold",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  },
  mainModal: {
    borderRadius: "20px",
  },
  quicktipbtn: {
    height: "28px",
    padding: "0 12px",
    margin: "0 !important",
    boxShadow: "0 1px 6px 0 rgba(0, 0, 0, 0.2)",
    textTransform: "capitalize",
  },
  quicktipbtnspce: {
    marginLeft: "5px",
  },
  headingbxstyle: {
    margin: "-12px -16px 20px",
    borderBottom: "1px solid #000",
  },
  bgwhite: {
    background: "#fff !important",
    boxShadow: "0 1px 6px 0 rgba(0, 0, 0, 0.2)",
  },
}));

function Info({ infoIconProps }: { infoIconProps?: InfoIconPropsType }) {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <Box
      style={{
        color: "#424242",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: 1.5,
        pointerEvents: "auto",
      }}
      onClick={(e: any) => {
        e.stopPropagation();
      }}
    >
      {/* <ActionIcon
        onClick={() => {
          open(), document.body.scrollIntoView({ behavior: "smooth" });
        }}
        variant="transparent"
        title="abc"
      >
        <IconInfoCircle size={20} />
      </ActionIcon> */}

      {/* <Modal
        classNames={{ header: classes.modalHeader, modal: classes.mainModal }}
        opened={opened}
        onClose={close}
        title="Quick Tip"
      >
        <Box
          dangerouslySetInnerHTML={{ __html: infoIconProps?.content ?? "" }}
          mt={30}
          fz={12}
        />
      </Modal> */}
      <Popover {...(infoIconProps?.popoverProps ?? {})}>
        <Popover.Target>
          {/* <ActionIcon variant="transparent">
            <IconInfoCircle size={20} />
          </ActionIcon> */}
          <Button
            className={classes.quicktipbtn}
            fullWidth={false}
            variant="white"
            bg="white"
            radius={20}
            fz={12}
            fw={400}
            color="dark.5"
            my="sm"
            style={{ pointerEvents: "all" }}
            onClick={() => {
              open();
            }}
          >
            <BulbIcon />
            <span className={classes.quicktipbtnspce}> Quick Tip</span>
          </Button>
        </Popover.Target>
        <Popover.Dropdown
          style={{ overflowY: "auto", zIndex: 9999, maxHeight: "250px" }}
          {...(infoIconProps?.popoverDropdownProps ?? {})}
          className={classes.bgwhite}
        >
          <Box className={classes.headingbxstyle} bg="#EEFCFA" p={15}>
            <Title order={2} fz={20}>
              Quick Tip
            </Title>
          </Box>
          <Box
            dangerouslySetInnerHTML={{ __html: infoIconProps?.content ?? "" }}
          />
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}
export default Info;
