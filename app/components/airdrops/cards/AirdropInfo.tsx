import { Box, Tag, Text, Tooltip } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ellipsisText, formatTemplateType } from "@/app/utils/clientHelper";
import { TemplateNamesType } from "@/app/lib/constants/templates";
import { QuestionIcon } from "@chakra-ui/icons";

export interface AirdropInfoProps {
  airdropTitle: string;
  templateNamesType: TemplateNamesType;
}

export default function AirdropInfo({ airdropTitle, templateNamesType }: AirdropInfoProps) {
  const { t } = useTranslation();
  return (
    <>
      <Text fontSize={{ base: "25px", sm: "30px" }} fontWeight={{ base: "600", sm: "400" }}>
        {ellipsisText(airdropTitle)}
      </Text>
      <Tag>
        {t(`dashboard.${formatTemplateType(templateNamesType)}`)}
        <Tooltip
          hasArrow
          label={t(`common.templateExplanation.${formatTemplateType(templateNamesType)}`)}
        >
          <QuestionIcon ml={1} />
        </Tooltip>
      </Tag>
    </>
  );
}
