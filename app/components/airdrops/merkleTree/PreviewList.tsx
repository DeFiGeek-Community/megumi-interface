import { useTranslation } from "react-i18next";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Tooltip,
  chakra,
  TableContainer,
  Switch,
  Box,
} from "@chakra-ui/react";
import { MerkleDistributorInfo } from "@/app/types/airdrop";
import { formatAmount, getEllipsizedAddress, getEtherscanLink } from "@/app/utils/clientHelper";
import { useState } from "react";
import { Link } from "../../common/Link";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function PreviewList({
  chainId,
  data,
  symbol = "",
  decimals = 18,
  preceision = 2,
}: {
  chainId: number;
  data: MerkleDistributorInfo;
  symbol?: string;
  decimals?: number;
  preceision?: number;
}) {
  const { t } = useTranslation();
  const [withoutDecimals, setWithoutDecimals] = useState<boolean>(false);
  return (
    <TableContainer>
      <Text fontSize={"sm"} fontWeight={"bold"}>
        {t("airdrop.merkleTreePreview.totalAmount")}:{" "}
        {formatAmount(data.airdropAmount, decimals, preceision)} {symbol}{" "}
        <chakra.span fontSize={"xs"} color={"gray.400"} fontWeight={"normal"}>
          ({data.airdropAmount})
        </chakra.span>
      </Text>

      <Text fontSize={"sm"} fontWeight={"bold"}>
        {t("airdrop.merkleTreePreview.eligibleUsersNum")}: {Object.entries(data.claims).length}
      </Text>
      <Table variant="simple" mt={4}>
        <Thead>
          <Tr>
            <Th verticalAlign={"top"}>{t("airdrop.merkleTreePreview.address")}</Th>
            <Th verticalAlign={"top"} isNumeric>
              {t("airdrop.merkleTreePreview.amount")}
              <Box fontSize={"xs"} fontWeight={"normal"}>
                {t("airdrop.merkleTreePreview.displayInMinUnit")}
                <Switch
                  size={"sm"}
                  isChecked={withoutDecimals}
                  onChange={() => setWithoutDecimals(!withoutDecimals)}
                />
              </Box>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(data.claims)
            .sort((a, b) => Number(BigInt(b[1].amount) - BigInt(a[1].amount)))
            .map(([address, claim], idx) => (
              <Tr key={idx}>
                <Td>
                  {/* <Tooltip label={address}>
                  {getEllipsizedAddress({ address: address as `0x${string}` })}
                </Tooltip> */}
                  <chakra.span fontSize={"xs"}>
                    <Link href={getEtherscanLink(chainId, address, "address")} target="_blank">
                      {address} <ExternalLinkIcon />
                    </Link>
                  </chakra.span>
                </Td>
                <Td isNumeric>
                  <chakra.span fontSize={"sm"}>
                    {withoutDecimals
                      ? BigInt(claim.amount).toString()
                      : formatAmount(claim.amount, decimals, preceision)}
                  </chakra.span>
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
