'use client';

import { useState } from 'react'; // useMemo
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn, isTokenOnChain } from '@/utils';
import { useChains } from '@/hooks/useChains';
import { useTokens } from '@/hooks/useTokens';
import { useTheme } from '@/hooks/useTheme';
import { ActionButton } from '@/components/ActionButton';
import { Balance, MaxButon } from '@/components/Balance';
import { Fees } from '@/components/Fees';
import { RateLimit } from '@/components/RateLimit';
import { SquareSVG } from '@/components/svg/square';
import { SwapSVG } from '@/components/svg/swap';
import { CircleSVG } from '@/components/svg/circle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { CardContent } from '@/components/ui/card';
import { Address } from 'viem';

const formSchema = z.object({
  from: z.string(),
  to: z.string(),
  token: z.string(),
  amount: z.string(),
});

export function BridgeForm() {
  const { style, variant } = useTheme();
  const { fromNetworks, toNetworks, fromChain, toChain, chainsInfo } =
    useChains();
  const { tokenBySymbol, tokensList, preselectedToken } = useTokens();

  const { address, chainId } = useAccount();

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: '',
      from: fromChain,
      to: toChain,
      token: preselectedToken,
    },
  });

  const sourceChainId = form.watch('from');
  const destinationChainId = form.watch('to');
  const amount = form.watch('amount');
  const selectedTokenSymbol = form.watch('token');
  const setAmount = (v: string) => form.setValue('amount', v);

  return (
    <CardContent className="mt-2">
      <Form {...form}>
        <form className="mb-[60px]">
          <h4 className="text-xl leading-[24px] font-semibold text-ccip-primary">
            Networks
          </h4>
          <div className="pt-6">
            <FormField
              control={form.control}
              name="from"
              render={({ field }) => (
                <FormItem>
                  <Label>From</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={fromChain}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 px-4 py-3 focus:ring-0 data-[state=open]:bg-ccip-popover text-ccip-text">
                        <SelectValue
                          placeholder={
                            <div className="flex items-center space-x-3">
                              <SquareSVG />
                              <span className="text-ccip-muted">Select</span>
                            </div>
                          }
                          asChild
                        >
                          <div className="flex items-center space-x-3">
                            {chainsInfo[Number(sourceChainId)]?.logoURL && (
                              <img
                                className="size-8"
                                src={chainsInfo[Number(sourceChainId)]?.logoURL}
                                alt={chainsInfo[Number(sourceChainId)]?.name}
                              />
                            )}
                            <span>
                              {chainsInfo[Number(sourceChainId)]?.name}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      className={cn(
                        'w-[calc(100vw-46px)] border border-ccip-border',
                        variant === 'compact' ? 'md:w-[325px]' : 'md:w-[423px]'
                      )}
                      style={style}
                    >
                      {fromNetworks
                        .filter(({ chainId }) => chainId !== destinationChainId)
                        .filter(({ chainId }) =>
                          selectedTokenSymbol
                            ? isTokenOnChain({
                                tokensList,
                                symbol: selectedTokenSymbol,
                                chainId: Number(chainId),
                              })
                            : true
                        )
                        .map(({ chainId, label, logo }) => (
                          <SelectItem
                            key={chainId}
                            value={chainId}
                            className="py-3 text-ccip-text"
                          >
                            <div className="flex items-center space-x-3">
                              {logo && (
                                <img
                                  className="size-8"
                                  src={logo}
                                  alt={label}
                                />
                              )}
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <div className="pt-6 relative">
            <SwapSVG
              className="absolute left-1/2 transform -translate-x-1/2 top-3 cursor-pointer group"
              onClick={() => {
                const from = form.getValues('from');
                const to = form.getValues('to');
                if (from && to) {
                  form.setValue('to', from);
                  form.setValue('from', to);
                }
              }}
            />
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <Label>To</Label>
                  <Select onValueChange={field.onChange} defaultValue={toChain}>
                    <FormControl>
                      <SelectTrigger className="h-14 px-4 py-3 focus:ring-0 data-[state=open]:bg-ccip-input text-ccip-text">
                        <SelectValue
                          placeholder={
                            <div className="flex items-center space-x-3">
                              <SquareSVG />
                              <span className="text-ccip-muted">Select</span>
                            </div>
                          }
                          asChild
                        >
                          <div className="flex items-center space-x-3">
                            {chainsInfo[Number(destinationChainId)]
                              ?.logoURL && (
                              <img
                                className="size-8"
                                src={
                                  chainsInfo[Number(destinationChainId)]
                                    ?.logoURL
                                }
                                alt={
                                  chainsInfo[Number(destinationChainId)]?.name
                                }
                              />
                            )}
                            <span>
                              {chainsInfo[Number(destinationChainId)]?.name}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      className={cn(
                        'w-[calc(100vw-46px)] border border-ccip-border',
                        variant === 'compact' ? 'md:w-[325px]' : 'md:w-[423px]'
                      )}
                      style={style}
                    >
                      {toNetworks
                        .filter(({ chainId }) => chainId !== sourceChainId)
                        .filter(({ chainId }) =>
                          selectedTokenSymbol
                            ? isTokenOnChain({
                                tokensList,
                                symbol: selectedTokenSymbol,
                                chainId: Number(chainId),
                              })
                            : true
                        )
                        .map(({ chainId, label, logo }) => (
                          <SelectItem
                            key={chainId}
                            value={chainId}
                            className="py-3 text-ccip-text"
                          >
                            <div className="flex items-center space-x-3">
                              {logo && (
                                <img
                                  className="size-8"
                                  src={logo}
                                  alt={label}
                                />
                              )}
                              <span>{label}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
          <h4 className="text-xl leading-[24px] font-semibold mt-8 mb-6 text-ccip-primary">
            Token
          </h4>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem>
                <Select
                  open={isOpen}
                  onOpenChange={(open) => setIsOpen(open)}
                  onValueChange={field.onChange}
                  defaultValue={preselectedToken}
                >
                  <div
                    className={cn(
                      'flex h-14 w-full space-x-4 items-center group rounded-md border border-ccip-border bg-ccip-input',
                      isOpen && 'bg-ccip-popover'
                    )}
                  >
                    <FormControl>
                      <SelectTrigger className="border-0 rounded-none my-3 p-0 pl-[1px] pr-4 ml-4 mr-0 border-r border-r-ccip-border text-ccip-text focus:ring-0 ring-offset-0 h-8 bg-inherit w-[152px] md:w-[168px] shrink-0">
                        <SelectValue
                          placeholder={
                            <div className="flex items-center space-x-3">
                              <CircleSVG />
                              <span className="text-ccip-muted">Select</span>
                            </div>
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <div className="grow flex items-center pr-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="h-8 border-none rounded-none bg-inherit focus-visible:ring-0 ring-offset-0 w-full mr-[1px] text-ccip-text pl-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]"
                                placeholder="Amount"
                                type="number"
                                inputMode="decimal"
                                {...field}
                                onChange={(e) => {
                                  if (Number(e.target.value) < 0) {
                                    return;
                                  }
                                  field.onChange(e);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {sourceChainId && selectedTokenSymbol ? (
                        // selectedTokenAddress ? (
                        <MaxButon
                          tokenAddress={
                            tokenBySymbol[selectedTokenSymbol].address[
                              Number(sourceChainId)
                            ] as Address
                          }
                          setAmount={setAmount}
                        />
                      ) : null}
                    </div>
                  </div>
                  <SelectContent
                    className={cn(
                      'w-[calc(100vw-46px)] -left-[17px] my-3  border border-ccip-border',
                      variant === 'compact' ? 'md:w-[325px]' : 'md:w-[423px]',
                      variant === 'drawer' ? '-left-[15px]' : '-left-[17px]'
                    )}
                    style={style}
                  >
                    {tokensList
                      .filter((token) =>
                        sourceChainId
                          ? Object.keys(token.address).includes(sourceChainId)
                          : true
                      )
                      .filter((token) =>
                        destinationChainId
                          ? Object.keys(token.address).includes(
                              destinationChainId
                            )
                          : true
                      )
                      .map((token) => (
                        <SelectItem
                          key={token.symbol}
                          value={token.symbol}
                          className="py-3 text-ccip-text"
                        >
                          <div className="flex items-center space-x-3">
                            {token.logoURL && (
                              <img
                                src={token.logoURL}
                                width={32}
                                height={32}
                                alt={token.symbol}
                              />
                            )}
                            <span>{token.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {sourceChainId && selectedTokenSymbol && (
            <Balance
              className="mt-4"
              tokenAddress={
                tokenBySymbol[selectedTokenSymbol].address[
                  Number(sourceChainId)
                ] as Address
              }
              amount={amount}
              setAmount={setAmount}
            />
          )}
        </form>
      </Form>
      {sourceChainId && destinationChainId && selectedTokenSymbol && address ? (
        <>
          <RateLimit
            sourceChain={Number(sourceChainId)}
            destinationChain={Number(destinationChainId)}
            amount={amount}
            tokenAddress={
              tokenBySymbol[selectedTokenSymbol].address[
                Number(sourceChainId)
              ] as Address
            }
            chainId={chainId}
          />
          <Fees
            sourceChain={Number(sourceChainId)}
            destinationChain={Number(destinationChainId)}
            amount={amount}
            tokenAddress={
              tokenBySymbol[selectedTokenSymbol].address[
                Number(sourceChainId)
              ] as Address
            }
            chainId={chainId}
          />
        </>
      ) : null}
      <ActionButton
        sourceChain={Number(sourceChainId)}
        destinationChain={Number(destinationChainId)}
        amount={amount}
        tokenAddress={
          tokenBySymbol[selectedTokenSymbol] &&
          (tokenBySymbol[selectedTokenSymbol].address[
            Number(sourceChainId)
          ] as Address)
        }
        address={address}
        chainId={chainId}
      />
    </CardContent>
  );
}
